# Architecture Notes

## Diagram

```
Browser (React SPA)
       |
       | HTTPS
       v
AWS Amplify Hosting           static frontend, CI from GitHub, TLS, CDN
       |
       | fetch(VITE_API_BASE_URL)
       v
Amazon API Gateway (HTTP API)  public edge, CORS, throttling
       |
       v
AWS Lambda: questforge-game-api  routing, validation, prompt build,
       |                          OpenAI call, state reducer
       |----> AWS SSM Parameter Store (SecureString)   OpenAI API key
       |----> OpenAI API                               narrative generation
       |----> Amazon DynamoDB: questforge              sessions, chapters, rate limits
       |
       v
Amazon CloudWatch Logs and Metrics     structured logs, alarms
AWS IAM                                least-privilege execution role
```

## Key decisions

1. OpenAI, not Bedrock. The article explains why honestly.
2. One Lambda with internal router. Three routes, one deploy unit, one warm OpenAI client.
3. HTTP API, not REST API. Cheaper, faster, simpler CORS.
4. Single DynamoDB table with generic pk/sk. One table, multiple access patterns.
5. Anonymous play by default. Client-generated playerId in localStorage.
6. Choice IDs, never raw text, cross the wire. Server resolves choice ID against stored chapter.
7. Model returns deltas; the reducer applies them. Model never directly sets state.
8. Rolling summary plus recent scenes. Full history never sent to OpenAI.
9. SAM for backend, Amplify Hosting for frontend.
