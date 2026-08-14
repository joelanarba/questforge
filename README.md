# QuestForge

AI-powered interactive text adventure with persistent world state. Built for the AWS Builder Center "Weekend Creative Challenge: Build a Creative App".

## Quick Start

### Prerequisites

- Node.js 20+
- AWS SAM CLI (for deployment)
- OpenAI API key

### Local Development

1. **API (backend)**
   ```bash
   cd api
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   npm install
   npm run dev
   ```

2. **Web (frontend)**
   ```bash
   cd web
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

### Deploy

```bash
# First time
sam build
sam deploy --guided

# After
sam build
sam deploy
```

## Architecture

```
Browser (React SPA on Amplify Hosting)
  -> API Gateway (HTTP API)
    -> Lambda (routing, validation, OpenAI call, state reducer)
      -> DynamoDB (sessions, chapters, rate limits)
      -> SSM Parameter Store (OpenAI key)
      -> OpenAI API (narrative generation)
```

## Live URLs

- **App**: https://main.d19npu0tbmgk5j.amplifyapp.com
- **API**: https://moimfmwqre.execute-api.us-east-1.amazonaws.com
