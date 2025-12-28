# Commands Reference

Quick reference for common operations:

## Generate Data

```bash
cd "/Users/mohammedsaif/Documents/Final Apps/data/dc"
npx tsx generate-data.ts
```

## Clear Data

```bash
cd "/Users/mohammedsaif/Documents/Final Apps/data/dc"
npx tsx clear-data.ts
```

## Clear and Regenerate

```bash
cd "/Users/mohammedsaif/Documents/Final Apps/data/dc"
npx tsx clear-data.ts && npx tsx generate-data.ts
```

## Environment Variables Required

- `MONGO_URI` or `MONGODB_URI` - MongoDB connection string (required)
- `AWS_ACCESS_KEY_ID` - AWS access key for S3 uploads (optional, for pathologist signatures)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3 uploads (optional)
- `AWS_S3_BUCKET_NAME` - S3 bucket name (optional)
- `AWS_REGION` - AWS region (optional, defaults to us-east-1)

## Notes

- The script generates 50 users, 50 tests, and 50 reports
- Users have phone numbers from +15555550101 to +15555550150
- All users have Indian Telugu names
- Diagnostic centers have Indian names and addresses
- Pathologist signatures use placeholder URLs if S3 is not configured

