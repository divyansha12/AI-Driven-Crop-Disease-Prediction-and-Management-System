# Leafwise ER Diagram

```mermaid
erDiagram
    USER ||--o{ FARM : owns
    USER ||--o{ CROP_IMAGE : uploads
    USER ||--o{ PREDICTION : creates
    CROP ||--o{ PREDICTION : classifies
    CROP_IMAGE ||--o{ PREDICTION : is_used_by
    DISEASE ||--o{ PREDICTION : has
    DISEASE ||--o{ TREATMENT : provides
    DISEASE ||--o{ PREVENTION : provides
    PREDICTION ||--o{ RECOMMENDATION : generates
    PREDICTION ||--o| PREDICTION_FEEDBACK : receives

    USER {
        int id PK
        string name
        string email UK
        string passwordHash
        string phone
        datetime createdAt
        datetime updatedAt
    }
    CROP {
        int id PK
        string name
    }
    FARM {
        int id PK
        string farmName
        string location
        float totalArea
        string soilType
        string irrigationType
        int userId FK
    }
    CROP_IMAGE {
        int id PK
        string url
        string filename
        string mimeType
        int sizeBytes
        datetime uploadedAt
        int userId FK
    }
    DISEASE {
        int id PK
        string name UK
        string cropName
        string displayName
        string description
        string symptoms
        boolean isHealthy
        datetime createdAt
    }
    PREDICTION {
        int id PK
        float confidence
        string rawLabel
        datetime createdAt
        int userId FK
        int cropId FK
        int imageId FK
        int diseaseId FK
    }
    TREATMENT {
        int id PK
        string title
        string description
        string applicationMethod
        string safetyNotes
        datetime createdAt
        int diseaseId FK
    }
    PREVENTION {
        int id PK
        string title
        string description
        datetime createdAt
        int diseaseId FK
    }
    RECOMMENDATION {
        int id PK
        string title
        string description
        string category
        string priority
        datetime createdAt
        int predictionId FK
    }
    PREDICTION_FEEDBACK {
        int id PK
        int rating
        boolean isCorrect
        string comment
        datetime createdAt
        int predictionId FK_UK
    }
```
