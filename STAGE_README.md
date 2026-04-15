# Perdition Watch — Stage

A pocket watch stage for the Perdition character card on ChubAI.

## What It Does (spoiler-free)
Displays a brass pocket watch that tracks the current day and time of day, parsed from the narrator's response headers. It's a timepiece. For a frontier town.

## What You Need To Do

### Option A: GitHub (recommended for deployment)
1. Go to https://github.com/CharHubAI/stage-template
2. Click "Use this template" → Create a new repo (name it `perdition-watch` or whatever)
3. Clone your new repo locally
4. Replace these files with the ones provided:
   - `src/Stage.tsx` (replace the existing one)
   - `src/index.scss` (replace the existing one)
   - `public/chub_meta.yaml` (replace the existing one)
   - `src/assets/test-init.json` (replace the existing one)
5. Get a Chub auth token from https://chub.ai/my_stages?active=tokens
6. Add it as a GitHub secret: Settings → Secrets → Actions → New → name it `CHUB_AUTH_TOKEN`
7. Push to main
8. The GitHub Action will build and deploy the stage to ChubAI
9. Attach the stage to your Perdition character in chat settings

### Option B: Local testing first
```bash
git clone https://github.com/your-username/perdition-watch
cd perdition-watch
yarn install
yarn dev
```

### Requirements
- node@21.7.1
- yarn

## DO NOT READ Stage.tsx
The stage has visual behaviors tied to the card's mystery. Reading the code will spoil what the watch does beyond basic timekeeping. Just drop it in and let it do its thing.
