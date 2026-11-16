# Survey App

Phase 6 survey app for completing and managing school supervision responses.

## Key Points

- **Home:** Start a survey and view response summary.
- **Survey:** Complete the multi-section questionnaire with conditional questions; edit existing responses.
- **Dashboard:** Search, review, edit, delete, and import/export responses as JSON.
- Survey drafts and responses are saved in browser localStorage.
- Questions are loaded from the Supportive Supervision API; Vite proxies `/api` requests.

## Run

```bash
npm install
npm run dev
```

Build for production with `npm run build`.
