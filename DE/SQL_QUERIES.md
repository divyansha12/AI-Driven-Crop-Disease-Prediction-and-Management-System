# Executed SQL Queries

The following ten queries were executed read-only against the local PostgreSQL
database on 2026-11-22. Values are actual query output. Identifying user data
was omitted.

## 1. Prediction history with disease and image

Purpose: retrieve predictions with disease and uploaded image details.

```sql
SELECT p."id", p."confidence", p."rawLabel",
       d."displayName", d."cropName", ci."filename", p."createdAt"
FROM "Prediction" p
JOIN "Disease" d ON d."id" = p."diseaseId"
JOIN "CropImage" ci ON ci."id" = p."imageId"
ORDER BY p."createdAt" DESC;
```

Actual output: prediction IDs `3`, `2`, and `1`; all confidence `0.741`; all
raw/detected disease `Tomato___Early_blight`; all display name `Early Blight`.

## 2. Disease-wise prediction counts

```sql
SELECT d."displayName", COUNT(p."id") AS prediction_count
FROM "Disease" d
LEFT JOIN "Prediction" p ON p."diseaseId" = d."id"
GROUP BY d."id", d."displayName"
ORDER BY prediction_count DESC, d."displayName";
```

Actual output: `Early Blight = 3`; every other listed disease = `0`.

## 3. Average confidence by disease

```sql
SELECT d."displayName",
       ROUND(AVG(p."confidence")::numeric, 3) AS average_confidence,
       COUNT(p."id") AS predictions
FROM "Prediction" p
JOIN "Disease" d ON d."id" = p."diseaseId"
GROUP BY d."displayName"
ORDER BY average_confidence DESC;
```

Actual output: `Early Blight | 0.741 | 3`.

## 4. User-wise activity report

```sql
SELECT COUNT(p."id") AS prediction_count,
       ROUND(AVG(p."confidence")::numeric, 3) AS average_confidence,
       MIN(p."createdAt") AS first_prediction,
       MAX(p."createdAt") AS latest_prediction
FROM "Prediction" p
JOIN "User" u ON u."id" = p."userId"
WHERE u."id" = 1;
```

Actual output: `3` predictions, average `0.741`, from `2026-11-13T08:12:49.213Z`
to `2026-11-13T08:18:19.067Z`.

## 5. Image-wise prediction count

```sql
SELECT ci."id", ci."filename", COUNT(p."id") AS prediction_count
FROM "CropImage" ci
LEFT JOIN "Prediction" p ON p."imageId" = ci."id"
GROUP BY ci."id", ci."filename"
ORDER BY prediction_count DESC, ci."id";
```

Actual output: three predictions each referenced one of image IDs `2`, `3`, and
`4`; image ID `1` had zero predictions.

## 6. Most frequent predicted diseases

```sql
SELECT d."displayName", COUNT(p."id") AS prediction_count
FROM "Prediction" p
JOIN "Disease" d ON d."id" = p."diseaseId"
GROUP BY d."displayName"
ORDER BY prediction_count DESC
LIMIT 5;
```

Actual output: `Early Blight | 3`.

## 7. Recent prediction history

```sql
SELECT p."id", d."displayName", p."confidence", p."createdAt"
FROM "Prediction" p
JOIN "Disease" d ON d."id" = p."diseaseId"
ORDER BY p."createdAt" DESC
LIMIT 5;
```

Actual output: IDs `3`, `2`, `1`, newest to oldest, all `Early Blight` with
confidence `0.741`.

## 8. Disease catalogue with prediction counts

```sql
SELECT d."cropName", d."displayName", d."isHealthy",
       COUNT(p."id") AS prediction_count
FROM "Disease" d
LEFT JOIN "Prediction" p ON p."diseaseId" = d."id"
GROUP BY d."id", d."cropName", d."displayName", d."isHealthy"
ORDER BY d."cropName", d."displayName";
```

Actual output: 10 disease rows; Tomato Early Blight had 3 predictions; the
remaining 9 listed diseases had 0.

## 9. Treatment information associated with diseases

```sql
SELECT d."displayName", t."title", t."applicationMethod"
FROM "Disease" d
LEFT JOIN "Treatment" t ON t."diseaseId" = d."id"
ORDER BY d."displayName", t."title"
LIMIT 20;
```

Actual output: all 10 disease rows were returned with `null` treatment title and
application method. The local `Treatment` table is empty.

## 10. Database totals

```sql
SELECT
  (SELECT COUNT(*) FROM "Farm") AS farm_count,
  (SELECT COUNT(*) FROM "Prediction") AS prediction_count,
  (SELECT COUNT(*) FROM "Disease") AS disease_count,
  (SELECT COUNT(*) FROM "CropImage") AS image_count;
```

Actual output: `0` farms, `3` predictions, `10` diseases, `4` images.

## Join and Index Explanation

The history and catalog queries use `JOIN` for required related records and
`LEFT JOIN` when an entity is allowed to have zero related predictions or
treatments. The `Prediction(userId, createdAt)` index supports user history
ordered by time. `Disease.name` is unique, `CropImage.userId`, `Farm.userId`,
and the other foreign-key indexes support ownership and relationship lookups.
