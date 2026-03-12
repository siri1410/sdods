# /deploy

Deploy this project to Firebase.

```bash
npm run build && \
npx firebase-tools@latest deploy \
  --only functions,hosting \
  --project $(cat .firebaserc | python3 -c "import json,sys; print(json.load(sys.stdin)['projects']['default'])") \
  --force
```
