# AWS Starter Repository

This repository contains a serverless application built with AWS SAM, featuring a Next.js frontend, a REST API, and a PostgreSQL database. The CI/CD pipeline is configured using Azure DevOps.

## Repository Structure

```
aws-starter/
├── api/                    # REST API Lambda function
│   ├── index.js            # API handler
│   └── package.json        # API dependencies
├── nextjs/                 # Next.js app
│   ├── pages/              # Next.js pages
│   │   ├── index.js        # Home page
│   │   └── api/            # Next.js API routes
│   │       └── hello.js    # Example API route
│   ├── public/             # Static assets
│   ├── index.js            # Lambda handler for Next.js
│   └── package.json        # Next.js dependencies
├── docker/                 # Docker config for local PostgreSQL
│   └── docker-compose.yml  # Docker Compose file
├── docs/                   # Documentation
│   └── design.md           # Design documentation
├── .gitignore              # Git ignore file
├── azure-pipelines.yml     # Azure DevOps CI/CD pipeline
├── package.json            # Root-level dependencies
└── template.yaml           # AWS SAM template
```

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- Docker and Docker Compose
- AWS SAM CLI
- AWS CLI (configured with appropriate credentials)

### Local Development

1. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install API dependencies
   cd api && npm install
   
   # Install Next.js dependencies
   cd nextjs && npm install
   ```

2. **Start Local PostgreSQL**
   ```bash
   npm run local-db
   ```

3. **Build SAM Application**
   ```bash
   npm run build
   ```

4. **Run API Locally**
   ```bash
   npm run local-api
   ```

5. **Test the API**
   ```bash
   curl http://localhost:3000/api
   ```

## Deployment

This repository is configured to deploy automatically to AWS when changes are pushed to the main branch via Azure DevOps pipeline.

### Manual Deployment

You can also deploy manually using the SAM CLI:

```bash
sam deploy --guided
```

## Notes

- Replace `subnet-123`, `subnet-456`, `sg-789` in `azure-pipelines.yml` with your actual AWS VPC subnet IDs and security group IDs.
- Store `DB_PASSWORD` securely in Azure DevOps variables.
- Add tests in `api/` and `nextjs/` directories if needed, and update the pipeline to run them.

## License

[MIT](LICENSE)
