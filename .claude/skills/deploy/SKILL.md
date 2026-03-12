# Deploy Skill

Handles deployment for this project.

## Trigger
"deploy", "ship it", "push to staging", "push to prod"

## Steps
1. Run build: `npm run build` or `pnpm build`
2. Run smoke tests: check health endpoint
3. Deploy: `firebase deploy --only functions,hosting --force`
4. Verify: curl health endpoint, check logs
5. Report: commit hash + Cloud Run revision + URL

## Rules
- Never deploy with failing tests
- Always verify staging before prod
- Force flag required to avoid "no changes detected" skip
