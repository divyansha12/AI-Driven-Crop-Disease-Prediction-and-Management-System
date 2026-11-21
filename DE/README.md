# Leafwise Data Engineering Documentation

This folder documents the actual implementation and database evidence in Leafwise.
It distinguishes verified implementation from pending external work.

## Database Selection and Justification

PostgreSQL is the primary database because Leafwise stores structured, highly
related records:

- users own farms, uploaded images, and predictions;
- predictions reference users, images, crops, and diseases;
- treatments and preventions belong to diseases;
- recommendations belong to predictions;
- feedback belongs to one prediction.

PostgreSQL provides primary keys, foreign keys, unique constraints, transactions,
SQL aggregation, indexes, and referential actions. These properties match the
application's relational workflow and prevent invalid cross-record references.
MongoDB was not selected as the primary database because the core data is
relational and frequently joined, and referential integrity is important.

## Architecture

```text
React Frontend
      |
      v
Express Backend
      |
      +--> Prisma 7
      |       |
      |       v
      |    PostgreSQL
      |
      +--> Python FastAPI ML boundary
```

Prediction workflow:

```text
Image Upload
    -> Multer validation and local storage
    -> CropImage metadata in PostgreSQL
    -> Node.js AI service
    -> Python service, when configured
    -> Disease lookup in PostgreSQL
    -> Prediction record in PostgreSQL
    -> Frontend result and history
```

The AI service is separate from PostgreSQL.

## Normalization

The schema follows relational normalization principles:

- 1NF: scalar fields are stored in columns and list-like treatment/prevention
  records are modeled as separate related rows.
- 2NF: records depend on their own primary keys; junction/relational entities
  are not used to hide composite facts.
- 3NF: disease description and symptoms are stored once in `Disease`, not
  duplicated in every prediction. User identity is stored in `User`, crop
  metadata in `Crop`, and image metadata in `CropImage`.

Foreign-key relationships remove duplicate ownership and support referential
integrity. No denormalized reporting table is currently present.

## Verified Database State

Read-only checks performed on 2026-11-22 found:

| Table | Row count |
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

No Prisma migration directory exists. `prisma migrate status` reported that the
live database is not currently managed by Prisma Migrate. This was not changed.

## Contents

- [ER Diagram](ER_DIAGRAM.md)
- [Final Schema](FINAL_SCHEMA.md)
- [Normalization](README.md)
- [SQL Queries](SQL_QUERIES.md)
- [Backend Integration](BACKEND_INTEGRATION.md)
- [Known Limitations](KNOWN_LIMITATIONS.md)
