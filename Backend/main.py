from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import io
import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
import google.generativeai as genai
from architecture import StableGeneCNN # Importing your custom class

# 1. INITIALIZE APP & CORS
app = FastAPI(title="Lung Cancer PGx API - ClearBox AI Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. LOAD ASSETS & CLEARBOX ENGINES
INPUT_LEN = 900
model = StableGeneCNN(input_len=INPUT_LEN)

# Configure Gemini for Layer 3 (Ensure GEMINI_API_KEY is in your environment variables)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY_HERE"))
llm = genai.GenerativeModel('gemini-1.5-flash')

try:
    # Load weights
    model.load_state_dict(torch.load("lung_model.pth", map_location=torch.device('cpu')))
    model.eval()
    print("✅ Model loaded successfully!")
    
    # Load SHAP Background for Layer 1
    background = torch.load("shap_background.pth", map_location=torch.device('cpu'))
    explainer = shap.GradientExplainer(model, background)
    print("✅ ClearBox Layer 1 (SHAP) loaded successfully!")
    
except Exception as e:
    print(f"❌ Error loading assets: {e}")

# Load the 900 required gene names
with open("model_genes.json", "r") as f:
    REQUIRED_GENES = json.load(f)

class GenomicData(BaseModel):
    expression_dict: dict[str, float]

# --- CLEARBOX LAYER 2: COUNTERFACTUAL ENGINE ---
def generate_counterfactual(input_tensor, model, current_prediction):
    """
    Uses gradient descent to find the minimum perturbation required 
    to flip the prediction (e.g., Resistant -> Sensitive).
    """
    target_class = 0 if current_prediction == 1 else 1 # Flip the class
    tensor_cf = input_tensor.clone().detach().requires_grad_(True)
    optimizer = torch.optim.Adam([tensor_cf], lr=0.1)
    
    # Run a quick 20-step optimization to simulate "What If" scenario
    for _ in range(20):
        optimizer.zero_grad()
        out = model(tensor_cf)
        loss = -torch.nn.functional.log_softmax(out, dim=1)[0, target_class]
        loss.backward()
        optimizer.step()
        
    diff = (tensor_cf - input_tensor).squeeze().detach().numpy()
    
    # Find the top 3 genes that needed the biggest change
    top_indices = np.argsort(np.abs(diff))[-3:][::-1]
    cf_changes = []
    for idx in top_indices:
        gene_name = REQUIRED_GENES[idx]
        direction = "decreased" if diff[idx] < 0 else "increased"
        cf_changes.append(f"{gene_name} needs to be {direction} by {abs(diff[idx]):.2f}")
        
    return cf_changes

@app.post("/predict")
async def predict(data: GenomicData):
    try:
        raw_dict = data.expression_dict
        input_dict = {
            str(k).upper().replace('"', '').replace("'", "").strip(): float(v) 
            for k, v in raw_dict.items()
        }
        
        incoming_data = pd.Series(input_dict)
        aligned_data = incoming_data.reindex(REQUIRED_GENES, fill_value=0.0).values
        input_tensor = torch.from_numpy(aligned_data).float().reshape(1, 1, 900)
        
        # --- BASE INFERENCE ---
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.softmax(output, dim=1)
            confidence, prediction = torch.max(probabilities, 1)
        
        pred_val = prediction.item()
        status = "Sensitive" if pred_val == 0 else "Resistant"
        conf_val = confidence.item() * 100
        
        # --- CLEARBOX LAYER 1: FEATURE ATTRIBUTION (SHAP) ---
        input_tensor.requires_grad_(True)
        shap_output = explainer.shap_values(input_tensor)
        
        if isinstance(shap_output, tuple):
            shap_values = shap_output[0]
        else:
            shap_values = shap_output
            
        # extract the correct class array
        if isinstance(shap_values, list):
            class_shap = shap_values[pred_val].squeeze()
        elif hasattr(shap_values, "shape"):
            if len(shap_values.shape) == 4:
                class_shap = shap_values[0, 0, :, pred_val]
            elif len(shap_values.shape) == 3:
                class_shap = shap_values[0, :, pred_val]
            else:
                class_shap = shap_values.squeeze()
        
        top_shap_idx = np.argsort(np.abs(class_shap))[-3:][::-1] # Top 3 driving genes
        
        attribution = {
            REQUIRED_GENES[i]: float(class_shap[i]) for i in top_shap_idx
        }
        
        # --- CLEARBOX LAYER 2: COUNTERFACTUAL ---
        counterfactuals = generate_counterfactual(input_tensor, model, pred_val)
        
        # --- CLEARBOX LAYER 3: NARRATIVE SYNTHESIZER (LLM) ---
        prompt = f"""
        You are an expert clinical pharmacogenomic AI assistant. Translate the following AI diagnostic data into a clear, plain-English summary for an oncologist.
        
        Diagnosis: {status} to Ulixertinib (Confidence: {conf_val:.1f}%)
        
        Top Biological Drivers (Layer 1 - Attribution):
        {attribution}
        (Note: Positive values pushed the model toward this diagnosis, negative pushed away).
        
        Hypothetical Intervention (Layer 2 - Counterfactual):
        To flip this patient's status from {status} to the opposite, the following gene expressions would need to change:
        {counterfactuals}
        
        Write a strict 3-sentence summary: 
        Sentence 1: The diagnosis and confidence.
        Sentence 2: The primary genetic driver behind this decision.
        Sentence 3: The biological pathway or gene expression change required to reverse this outcome.
        Do not use bolding or markdown. Keep it highly professional.
        """
        
        try:
            narrative_response = llm.generate_content(prompt)
            narrative = narrative_response.text.strip()
        except Exception as api_err:
            print(f"⚠️ Layer 3 Narrative Skipped (API Key missing/invalid). Using structured fallback.")
            top_genes = list(attribution.keys())[:2]
            primary_driver = top_genes[0] if len(top_genes) > 0 else "unknown baseline factors"
            secondary_driver = top_genes[1] if len(top_genes) > 1 else "synergistic markers"
            
            narrative = (f"The patient is classified as {status} to Ulixertinib with {conf_val:.1f}% algorithmic confidence. "
                         f"The primary biological drivers behind this decision strongly point toward the expression levels of {primary_driver} and {secondary_driver}. "
                         f"To hypothetically reverse this diagnosis, targeted intervention must simulate the precise pathway shifts identified in the counterfactual profile.")

        return {
            "prediction": status,
            "confidence": f"{conf_val:.2f}%",
            "clearbox_layer_1_attribution": attribution,
            "clearbox_layer_2_counterfactuals": counterfactuals,
            "clearbox_layer_3_narrative": narrative
        }
        
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)