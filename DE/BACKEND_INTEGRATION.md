# Database-Backend Integration

## Prisma 7 Configuration

The backend loads `DATABASE_URL` through `backend/prisma.config.ts` and uses
`@prisma/adapter-pg` with the `pg` PostgreSQL driver.

Example create operation:

```javascript
const prediction = await prisma.prediction.create({
  data: {
    confidence: result.confidence,
    rawLabel: result.rawLabel,
    userId: req.user.id,
    cropId,
    imageId: image.id,
    diseaseId: result.disease.id,
  },
  include: { image: true, disease: true },
});
```

Example read operation:

```javascript
const predictions = await prisma.prediction.findMany({
  where: { userId: req.user.id },
  orderBy: { createdAt: "desc" },
  include: { image: true, disease: true },
});
```

## Authentication-Scoped Access

Protected prediction routes derive `req.user.id` from a JWT. The list and detail
queries scope records by `userId`, preventing cross-user history access.

## Prediction Workflow

1. Multer validates the multipart image type and 5 MB limit.
2. The image is saved locally and a `CropImage` row is created.
3. Node validates optional `cropId`.
4. Node calls the Python AI service when configured.
5. The returned label is matched to `Disease.name`.
6. A `Prediction` row is created.
7. Frontend receives the prediction and may download a PDF.

If the AI or database operation fails after image record creation, the
controller attempts to remove the image record and uploaded file.

## Current Transaction Status

The implemented workflow is compensation-based rather than a single database
transaction: database image/prediction writes and external AI/file operations
cannot be placed into one Prisma transaction safely. A schema migration or
transaction change was not applied during this documentation task.
