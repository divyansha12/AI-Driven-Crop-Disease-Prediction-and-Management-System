# Verified Known Limitations

## Real AI Model

The repository does not contain:

- `crop_disease_model.keras`;
- `class_indices.json`;
- TensorFlow/Pillow/FastAPI runtime dependencies.

The Node and Python integration is implemented, but real image inference was
not executable during verification. Development may use deterministic mock
predictions; production does not fall back to mock predictions when
`ML_SERVICE_URL` is not configured.

New prediction creation responses identify `predictionSource` as `mock` or
`real`. This marker is not persisted in the historical database schema.

## Database Migration

The live database is not currently managed by Prisma Migrate. No migration
directory exists, and no migration or reset was run.

Before migration work:

1. back up PostgreSQL;
2. compare live schema with Prisma;
3. create a baseline migration;
4. mark the baseline applied only after verification;
5. preserve existing rows.

## Seed and Management Data

The local database contains 10 disease records. It contains:

- zero treatments;
- zero preventions;
- zero recommendations;
- zero prediction feedback;
- zero crops;
- zero farms.

Treatment, recommendation, feedback, and prevention implementation should not
be claimed complete until their routes/controllers and actual database data are
verified.
