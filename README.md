# ClassLens AI

ClassLens AI is a Next.js prototype for evidence-based evaluation of online children's classes. It accepts a direct video upload or an individual Google Drive video URL, previews the source, and produces a structured assessment only when an organizer-approved multimodal analysis provider is configured.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local` only after permission has been granted to process recordings with Gemini. The direct-analysis prototype accepts MP4, MOV, and WebM files up to 20 MB. Without that key, it fails clearly rather than producing mock results.

## Architecture

The browser handles source selection, local preview, and progress states. `POST /api/analyze` validates the input and delegates uploaded media to `lib/gemini.ts`. The Gemini response is parsed and validated with Zod, its weighted score is recalculated server-side, and the UI renders only the validated contract. Google Drive links are safely parsed and previewed, but private Drive media is not downloaded or forwarded without an authorized connector.

## Scoring

The prototype uses configurable rubric weights: teaching clarity 25%, student engagement 25%, lesson structure 20%, examples and explanations 15%, and audio/visual usability 15%. Thresholds are Poor 0–39, Average 40–59, Good 60–79, Excellent 80–100. These are product rubric choices, not scientifically validated thresholds.

## Known limitations

Direct upload is intentionally capped at 20 MB so the serverless prototype stays within practical request limits. A production deployment should use an authenticated temporary object-storage upload and an asynchronous worker for larger recordings. Drive preview access does not imply download access, so an authorized Drive integration is required for backend analysis. No assessment is generated when evidence is unavailable or the provider is not configured.

## Challenge submission note

Do not commit recordings, API keys, or fabricated AI interaction history. Add only a redacted, factual development log if the challenge requires AI usage history.
