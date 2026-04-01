from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import io
import os
import joblib
import numpy as np
from architecture import StableGeneCNN # Importing your custom class

# 1. INITIALIZE APP & CORS
app = FastAPI(title="Lung Cancer PGx API")

# This allows your team's frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In a hackathon, '*' is fine; in production, be specific
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. LOAD ASSETS (Do this once at startup)
INPUT_LEN = 900
model = StableGeneCNN(input_len=INPUT_LEN)

try:
    # Load weights
    model.load_state_dict(torch.load("lung_model.pth", map_location=torch.device('cpu')))
    model.eval()
    
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading assets: {e}")

# 3. DEFINE INPUT DATA SCHEMA
class GenomicData(BaseModel):
    # This expects a dictionary of { "GeneName": value }
    expression_dict: dict[str, float]

# 4. PREDICTION ENDPOINT
import json
import pandas as pd

# Load the 900 required gene names
with open("model_genes.json", "r") as f:
    REQUIRED_GENES = json.load(f)

@app.post("/predict")
async def predict(data: GenomicData):
    try:
        # 1. Aggressive cleaning of input keys (remove quotes, spaces, etc.)
        raw_dict = data.expression_dict
        input_dict = {
            str(k).upper().replace('"', '').replace("'", "").strip(): float(v) 
            for k, v in raw_dict.items()
        }
        
        # DEBUG: Print the first 20 keys received to see what they look like
        sample_received = list(input_dict.keys())[:20]
        print(f"\n🔍 DEBUG: Received {len(input_dict)} keys. First 20: {sample_received}")
        
        incoming_data = pd.Series(input_dict)

        # 2. Reindex and Aligned
        aligned_data = incoming_data.reindex(REQUIRED_GENES, fill_value=0.0).values
        
        # 3. Match Analysis (Debugging)
        found_genes = [g for g in REQUIRED_GENES if g in input_dict]
        missing_genes = [g for g in REQUIRED_GENES if g not in input_dict]
        found_count = len(found_genes)
        
        print("\n" + "="*50)
        print(f"📊 MATCH ANALYSIS: {found_count} / {len(REQUIRED_GENES)} genes matched.")
        if found_count > 0:
            print(f"✅ Sample Matched: {found_genes[:10]}")
        if missing_genes:
            print(f"❌ Sample Missing: {missing_genes[:10]}")
        print("="*50 + "\n")
        
        # 5. Reshape for the CNN (Batch=1, Channel=1, Length=900)
        input_tensor = torch.from_numpy(aligned_data).float().reshape(1, 1, 900)
        
        # 6. Inference
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.softmax(output, dim=1)
            confidence, prediction = torch.max(probabilities, 1)
        
        status = "Sensitive" if prediction.item() == 0 else "Resistant"
        conf_val = confidence.item() * 100
        
        # Build analysis string based on data quality
        analysis = f"Model analyzed 900 features (Matched: {found_count}/900). "
        if found_count < 450:
            analysis += "⚠️ Low gene match rate. Results may be inaccurate."
        else:
            analysis += "✅ High-quality genomic alignment detected."

        return {
            "prediction": status,
            "confidence": f"{conf_val:.2f}%",
            "analysis": analysis,
            "match_count": found_count
        }
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_batch")
async def predict_batch(file: UploadFile = File(...)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        sensitive_list = []
        resistant_list = []
        
        id_col = None
        for col in df.columns:
            if col.upper().strip() in ['COSMIC_ID', 'ID', 'PATIENT_ID']:
                id_col = col
                break
        
        for index, row in df.iterrows():
            patient_id = str(row[id_col]) if id_col else f"patient_{index}"
            
            raw_dict = row.to_dict()
            input_dict = {}
            for k, v in raw_dict.items():
                if k == id_col: continue
                try:
                    val = float(v)
                    if not pd.isna(val):
                        input_dict[str(k).upper().replace('"', '').replace("'", "").strip()] = val
                except (ValueError, TypeError):
                    continue
            
            incoming_data = pd.Series(input_dict)
            aligned_data = incoming_data.reindex(REQUIRED_GENES, fill_value=0.0).values
            input_tensor = torch.from_numpy(aligned_data).float().reshape(1, 1, 900)
            
            with torch.no_grad():
                output = model(input_tensor)
                probabilities = torch.softmax(output, dim=1)
                _, prediction = torch.max(probabilities, 1)
                
            status = "Sensitive" if prediction.item() == 0 else "Resistant"
            
            if status == "Sensitive":
                sensitive_list.append(patient_id)
            else:
                resistant_list.append(patient_id)
                
        return {
            "sensitive": sensitive_list,
            "resistant": resistant_list
        }
    except Exception as e:
        print(f"❌ Batch Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
