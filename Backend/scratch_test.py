import torch
import shap
from architecture import StableGeneCNN

model = StableGeneCNN(input_len=900)
model.load_state_dict(torch.load('lung_model.pth', map_location='cpu'))
model.eval()

background = torch.load('shap_background.pth', map_location='cpu')
explainer = shap.GradientExplainer(model, background)

input_tensor = torch.randn(1, 1, 900, requires_grad=True)
try:
    ret = explainer.shap_values(input_tensor)
    print(f'Type of ret: {type(ret)}')
    if isinstance(ret, list):
        print(f'List length: {len(ret)}')
        for ind, item in enumerate(ret):
            print(f'Item {ind} type: {type(item)}, shape: {getattr(item, "shape", None)}')
    elif isinstance(ret, tuple):
        print(f'Tuple length: {len(ret)}')
    else:
        print(f'Ret shape: {getattr(ret, "shape", None)}')
except Exception as e:
    print(f'Error: {e}')
