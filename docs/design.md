### Repository Structure

Here’s the recommended layout:

```
your-repo/
├── api/                    # REST API Lambda function
│   ├── index.js            # API handler
│   └── package.json        # API dependencies
├── nextjs/                 # Next.js app
│   ├── pages/              # Next.js pages
│   │   ├── index.js        # Home page
│   │   └── api/            # Next.js API routes (optional)
│   │       └── hello.js    # Example API route
│   ├── public/             # Static assets (optional)
│   ├── index.js            # Lambda handler for Next.js
│   └── package.json        # Next.js dependencies
├── docker/                 # Docker config for local PostgreSQL
│   └── docker-compose.yml  # Docker Compose file
├── .gitignore              # Git ignore file
├── azure-pipelines.yml     # Azure DevOps CI/CD pipeline
├── package.json            # Root-level dependencies (e.g., SAM CLI)
└── template.yaml           # AWS SAM template
```

### File Details and Contents

#### 1. Root-Level Files

- **`.gitignore`**  
  Ignore node modules, build artifacts, etc.
  ```
  node_modules/
  .sam/
  build/
  *.log
  .env
  ```

- **`package.json`**  
  Root-level dependencies for development (e.g., SAM CLI).
  ```json
  {
    "name": "your-repo",
    "version": "1.0.0",
    "scripts": {
      "build": "sam build",
      "local-api": "sam local start-api --port 3000",
      "local-db": "docker-compose -f docker/docker-compose.yml up -d"
    },
    "devDependencies": {
      "aws-sam-cli": "latest"
    }
  }
  ```

- **`template.yaml`**  
  AWS SAM template for Lambda, API Gateway, and Aurora Serverless.
  ```yaml
  AWSTemplateFormatVersion: '2010-09-09'
  Transform: AWS::Serverless-2016-10-31

  Resources:
    NextJsFunction:
      Type: AWS::Serverless::Function
      Properties:
        Handler: nextjs/index.handler
        Runtime: nodejs18.x
        MemorySize: 1024
        Timeout: 10
        Events:
          Api:
            Type: Api
            Properties:
              Path: /{proxy+}
              Method: ANY
        VpcConfig:
          SubnetIds: !Ref SubnetIds
          SecurityGroupIds: !Ref SecurityGroupIds
        Environment:
          Variables:
            DATABASE_URL: !Sub "postgresql://${DBUser}:${DBPassword}@${DBEndpoint}:5432/mydb"

    ApiFunction:
      Type: AWS::Serverless::Function
      Properties:
        Handler: api/index.handler
        Runtime: nodejs18.x
        Events:
          Api:
            Type: Api
            Properties:
              Path: /api/{proxy+}
              Method: ANY
        VpcConfig:
          SubnetIds: !Ref SubnetIds
          SecurityGroupIds: !Ref SecurityGroupIds
        Environment:
          Variables:
            DATABASE_URL: !Sub "postgresql://${DBUser}:${DBPassword}@${DBEndpoint}:5432/mydb"

    DatabaseCluster:
      Type: AWS::RDS::DBCluster
      Properties:
        Engine: aurora-postgresql
        EngineMode: serverless
        ScalingConfiguration:
          MinCapacity: 1
          MaxCapacity: 4
          AutoPause: true
        MasterUsername: !Ref DBUser
        MasterUserPassword: !Ref DBPassword
        DatabaseName: mydb
        VpcSecurityGroupIds: !Ref SecurityGroupIds
        SubnetIds: !Ref SubnetIds

  Parameters:
    DBUser: { Type: String, Default: "admin" }
    DBPassword: { Type: String, NoEcho: true }
    SubnetIds: { Type: List<AWS::EC2::Subnet::Id> }
    SecurityGroupIds: { Type: List<AWS::EC2::SecurityGroup::Id> }

  Outputs:
    ApiUrl:
      Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
  ```

- **`azure-pipelines.yml`**  
  Azure DevOps pipeline for CI/CD.
  ```yaml
  trigger:
    branches:
      include:
        - main

  pool:
    vmImage: 'ubuntu-latest'

  steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: |
      npm install -g aws-sam-local
      npm install
    displayName: 'Install dependencies'

  - script: |
      sam build
    displayName: 'Build SAM application'

  - script: |
      echo "Running tests (placeholder)"
    displayName: 'Run tests'

  - task: AWSShellScript@1
    inputs:
      awsCredentials: 'aws-service-connection'
      regionName: 'us-east-1'
      scriptType: 'inline'
      inlineScript: |
        sam deploy --stack-name my-app-stack \
          --capabilities CAPABILITY_IAM \
          --parameter-overrides DBUser=admin DBPassword=$DB_PASSWORD \
          SubnetIds=subnet-123,subnet-456 SecurityGroupIds=sg-789
    env:
      DB_PASSWORD: $(dbPassword)
    displayName: 'Deploy to AWS'
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  ```

#### 2. `api/` Directory (REST API Lambda)

- **`api/index.js`**  
  Simple REST API handler with PostgreSQL connection.
  ```javascript
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  exports.handler = async (event) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      await client.release();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello from API', time: result.rows[0].now }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      };
    }
  };
  ```

- **`api/package.json`**  
  Dependencies for the API.
  ```json
  {
    "name": "api",
    "version": "1.0.0",
    "dependencies": {
      "pg": "^8.11.3"
    }
  }
  ```

#### 3. `nextjs/` Directory (Next.js App)

- **`nextjs/index.js`**  
  Lambda handler for Next.js.
  ```javascript
  const next = require('next');
  const app = next({ dev: false, dir: __dirname });
  const handle = app.getRequestHandler();

  exports.handler = async (event, context) => {
    await app.prepare();
    const { path } = event;
    return new Promise((resolve, reject) => {
      handle(event, context, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
  ```

- **`nextjs/pages/index.js`**  
  Basic Next.js home page.
  ```javascript
  export default function Home() {
    return <h1>Welcome to Next.js on Lambda!</h1>;
  }
  ```

- **`nextjs/pages/api/hello.js`**  
  Optional Next.js API route (for testing).
  ```javascript
  export default function handler(req, res) {
    res.status(200).json({ message: 'Hello from Next.js API' });
  }
  ```

- **`nextjs/package.json`**  
  Dependencies for Next.js.
  ```json
  {
    "name": "nextjs",
    "version": "1.0.0",
    "dependencies": {
      "next": "^14.1.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    "scripts": {
      "build": "next build"
    }
  }
  ```

#### 4. `docker/` Directory (Local PostgreSQL)

- **`docker/docker-compose.yml`**  
  Docker Compose for local PostgreSQL.
  ```yaml
  version: '3.8'
  services:
    postgres:
      image: postgres:15
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: admin
        POSTGRES_PASSWORD: password
        POSTGRES_DB: mydb
      volumes:
        - pgdata:/var/lib/postgresql/data

  volumes:
    pgdata:
  ```

### How to Use the Repo

1. **Initialize the Repo**  
   - Create a new repo in Azure DevOps.
   - Clone it locally: `git clone <repo-url>`.
   - Create the directory structure and add the files above.

2. **Local Setup**  
   - Install dependencies: `npm install` (root), `cd api && npm install`, `cd nextjs && npm install`.
   - Start PostgreSQL: `npm run local-db`.
   - Build SAM: `npm run build`.
   - Run API locally: `sam local start-api --port 3000`.
   - Test: `curl http://localhost:3000/api`.

3. **Push to Azure DevOps**  
   - Commit and push: `git add . && git commit -m "Initial setup" && git push origin main`.
   - Configure the pipeline in Azure DevOps (Service Connection, Variables) as described earlier.

4. **Deployment**  
   - On `main` branch push, the pipeline builds and deploys to AWS.

### Notes
- Replace `subnet-123`, `subnet-456`, `sg-789` in `azure-pipelines.yml` with your actual AWS VPC subnet IDs and security group IDs.
- Store `DB_PASSWORD` securely in Azure DevOps variables.
- Add tests in `api/` and `nextjs/` if needed, and update the pipeline to run them.

This repo provides everything to develop locally and deploy to AWS via Azure DevOps. 
