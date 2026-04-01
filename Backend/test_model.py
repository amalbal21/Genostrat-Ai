import torch
import numpy as np
from architecture import StableGeneCNN
import json

def test():
    INPUT_LEN = 900
    model = StableGeneCNN(input_len=INPUT_LEN)
    
    try:
        model.load_state_dict(torch.load("lung_model.pth", map_location=torch.device('cpu')))
        model.eval()
        print("✅ Model loaded.")
    except Exception as e:
        print(f"❌ Load error: {e}")
        return

    # Test 1: All Zeros
    input_0 = torch.zeros(1, 1, 900)
    with torch.no_grad():
        out_0 = torch.softmax(model(input_0), dim=1)
        conf_0, pred_0 = torch.max(out_0, 1)
        print(f"
[Test All Zeros]: Pred={pred_0.item()}, Conf={conf_0.item()*100:.2f}%")

    # Test 2: All Ones (Simulated expression)
    input_1 = torch.ones(1, 1, 900)
    with torch.no_grad():
        out_1 = torch.softmax(model(input_1), dim=1)
        conf_1, pred_1 = torch.max(out_1, 1)
        print(f"[Test All Ones]:  Pred={pred_1.item()}, Conf={conf_1.item()*100:.2f}%")

    # Test 3: Random
    input_r = torch.randn(1, 1, 900)
    with torch.no_grad():
        out_r = torch.softmax(model(input_r), dim=1)
        conf_r, pred_r = torch.max(out_r, 1)
        print(f"[Test Random]:    Pred={pred_r.item()}, Conf={conf_r.item()*100:.2f}%")

if __name__ == "__main__":
    test()
