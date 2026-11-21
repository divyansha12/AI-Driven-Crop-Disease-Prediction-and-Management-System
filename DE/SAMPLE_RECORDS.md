# Verified Sample Records

The following values are summarized from the read-only database checks. User
names and email addresses are not reproduced.

## Table counts

| Table | Count |
|---|---:|
| User | 1 |
| Farm | 0 |
| Crop | 0 |
| Disease | 10 |
| CropImage | 4 |
| Prediction | 3 |
| Treatment | 0 |
| Prevention | 0 |
| Recommendation | 0 |
| PredictionFeedback | 0 |

## Prediction records

The executed prediction-history query returned:

| Prediction ID | Confidence | Raw label | Display disease | Crop |
|---:|---:|---|---|---|
| 3 | 0.741 | Tomato___Early_blight | Early Blight | Tomato |
| 2 | 0.741 | Tomato___Early_blight | Early Blight | Tomato |
| 1 | 0.741 | Tomato___Early_blight | Early Blight | Tomato |

Timestamps:

- ID 1: `2026-11-13T08:12:49.213Z`
- ID 2: `2026-11-13T08:18:19.028Z`
- ID 3: `2026-11-13T08:18:19.067Z`

These records do not prove real machine-learning inference. The local mock
predictor previously generated them or a prior mock-compatible workflow may
have generated them.
