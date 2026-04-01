import torch
import torch.nn as nn


class StableGeneCNN(nn.Module):
    def __init__(self, input_len):
        super(StableGeneCNN, self).__init__()

        # --- 1. Consolidated Feature Stack ---
        self.feature_stack = nn.Sequential(
            # Layer 1
            nn.Conv1d(1, 16, kernel_size=100, stride=100),
            nn.ReLU(),
            nn.Dropout(p=0.2),

            # Layer 2
            nn.Conv1d(16, 32, kernel_size=5, stride=2),
            nn.ReLU(),
            nn.Dropout(p=0.2),

            # Pooling
            nn.MaxPool1d(kernel_size=2, stride=2)
        )

        # --- 2. DYNAMIC CALCULATION OF FLATTENED SIZE (THE FIX) ---
        # This prevents crashes when features are reduced (as you did with VarianceThreshold)
        dummy_input = torch.randn(1, 1, input_len)
        dummy_output = self.feature_stack(dummy_input)
        FLATTENED_SIZE = dummy_output.numel()

        # --- 3. Fully Connected Layers (Classification) ---
        self.fc1 = nn.Linear(FLATTENED_SIZE, 64)
        self.fc3 = nn.Dropout(p=0.5)
        self.fc2 = nn.Linear(64, 2)

    def forward(self, x):
        x = self.feature_stack(x) # Run through Conv/Pool layers
        x = x.view(x.size(0), -1) # Flatten dynamically

        x = self.fc1(x)
        x = self.fc3(x)
        x = self.fc2(x)
        return x
