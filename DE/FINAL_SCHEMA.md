# Leafwise Final Prisma Schema Summary

The live PostgreSQL schema matches `backend/prisma/schema.prisma` for the ten
models verified during the read-only audit.

## User

| Column | Type | Constraint |
|---|---|---|
| id | Integer | Primary key, autoincrement |
| name | String | Required |
| email | String | Required, unique |
| passwordHash | String | Required |
| phone | String | Optional |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Updated automatically |

## Crop

| Column | Type | Constraint |
|---|---|---|
| id | Integer | Primary key, autoincrement |
| name | String | Required |

## Farm

| Column | Type | Constraint |
|---|---|---|
| id | Integer | Primary key |
| farmName | String | Required |
| location | String | Required |
| totalArea | Float | Required |
| soilType | String | Required |
| irrigationType | String | Required |
| userId | Integer | Foreign key to User, cascade delete |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Updated automatically |

Index: `Farm(userId)`.

## Disease

Unique disease name, used to match AI labels. Indexes include the unique name
constraint. Fields: `id`, `name`, `cropName`, `displayName`, `description`,
`symptoms`, `isHealthy`, `createdAt`.

## CropImage

Stores image URL/path, original filename, MIME type, size, upload time, and
owner. `userId` uses cascade delete. Index: `CropImage(userId)`.

## Prediction

Stores confidence, raw AI label, creation time, and references to user, optional
crop, image, and disease. Referential actions:

- user delete: cascade
- crop delete: set null
- image delete: cascade
- disease delete: restricted or otherwise no configured cascade

Composite index: `Prediction(userId, createdAt)`.

## Treatment

Fields include title, description, application method, safety notes, creation
time, and disease foreign key with cascade delete. Index: `Treatment(diseaseId)`.

## Prevention

Fields include title, description, creation time, and disease foreign key with
cascade delete. Index: `Prevention(diseaseId)`.

## Recommendation

Fields include title, description, category, priority, creation time, and
prediction foreign key with cascade delete. Index:
`Recommendation(predictionId)`.

## PredictionFeedback

Fields include rating, correctness flag, comment, creation time, and unique
prediction foreign key with cascade delete.
