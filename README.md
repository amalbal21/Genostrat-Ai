# GenoStrat AI: In-Silico Patient Stratification via 1D Convolutional Neural Networks

<div align="center">

[![Domain](https://img.shields.io/badge/Domain-Healthcare%20%2F%20Oncology-blue.svg)]()
[![Tech Stack](https://img.shields.io/badge/Tech-PyTorch%20%7C%20FastAPI%20%7C%20Streamlit-orange.svg)]()
[![College](https://img.shields.io/badge/Institution-M.I.E.T.%20Engineering%20College-green.svg)]()

</div>

---

## 🚀 About The Project

**GenoStrat AI** is a deep learning-driven healthcare application developed by team **TechVengers** from M.I.E.T. Engineering College for Hack Hustle 2.0. 

Oncology drug development suffers from a **90% attrition rate during clinical trials** primarily because "all-comer" trials include patients who are genetically resistant to the drug, masking its true efficacy. GenoStrat AI solves this by introducing an automated **In-Silico Stratification engine** powered by a **1D Convolutional Neural Network (1D CNN)** to predict oncology drug sensitivity accurately.

---

## 🔍 The Problem Statement: The $3 Billion "Trial & Error" Crisis

* **The Specific Challenge:** Clinical trial failures occur due to generalized participant pools containing genetically resistant individuals.
* **Market Gap:** Traditional pharmaceutical pipelines rely on generalized biomarkers or linear statistical models (like Elastic-Net) that fail to capture complex, non-linear spatial relationships in a patient's genomic signature.
* **Scale of the Problem:**
  * *Financial:* A single Phase III trial failure costs between **$800M and $1.4B**.
  * *Clinical:* Ineffective treatments subject patients to extreme toxicity without therapeutic benefit, costing lives and wasting critical time.

---

## 💡 Proposed Solution & Innovation

* **Critical Analysis vs Innovation:** Current solutions use "Black Box" linear regression that treats genes as independent variables, missing the "biological neighborhood" effect. GenoStrat AI utilizes a **1D CNN architecture** to extract spatial genomic features across 900 prioritized biomarkers without sacrificing computational speed[cite: 9].
* **Accuracy:** Achieved a benchmark-matching **80% accuracy** in sensitivity prediction[cite: 9].
* **ClearBox AI (XAI):** Integrated using **SHAP** and **Google Gemini API** to synthesize complex tensor predictions into plain-English clinical reports for oncologists[cite: 9].

---

## 🛠️ Tech Stack & System Design

* **Frontend:** Streamlit / React (Interactive Clinical Dashboard for real-time patient file uploads)[cite: 9]
* **Backend:** Python / FastAPI (High-performance asynchronous inference engine)[cite: 9]
* **ML Engine:** PyTorch (1D CNN Architecture) & Scikit-Learn[cite: 9]
* **Explainability (XAI):** SHAP (Attribution Layer) & Google Gemini API (Narrative Synthesis Layer)[cite: 9]
* **Infrastructure:** GitHub (Version Control), Docker (Containerized Deployment)[cite: 9]

### System Architecture Flow:
```text
[Patient Genomic Profile (CSV/JSON)] 
       │
       ▼
[Feature Alignment] 
       │
       ▼
[1D CNN Inference Engine] 
       │
       ▼
[Sensitivity Score + ClearBox Narrative Summary]
