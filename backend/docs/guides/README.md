# Setup guides (PDF + source)

## PDF files (ready to use)

| Guide | PDF | Markdown source |
|-------|-----|-----------------|
| Amazon S3 bucket + IAM setup | [S3-Bucket-Setup-Guide.pdf](./S3-Bucket-Setup-Guide.pdf) | [s3-bucket-setup-guide.md](./s3-bucket-setup-guide.md) |
| Express backend on Vercel | [Vercel-Backend-Deployment-Guide.pdf](./Vercel-Backend-Deployment-Guide.pdf) | [vercel-backend-deployment-guide.md](./vercel-backend-deployment-guide.md) |

Use these for **any** project — not only this repo.

## Regenerate PDFs

Requires Google Chrome installed (macOS path is auto-detected).

```bash
cd backend/docs/guides
npm install marked puppeteer-core
node generate-pdfs.mjs
```

Output:

- `S3-Bucket-Setup-Guide.pdf`
- `Vercel-Backend-Deployment-Guide.pdf`
