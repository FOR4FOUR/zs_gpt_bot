### GPT Telegram Bot (Text + Voice)

Node.js Telegram bot that chats with OpenAI and transcribes voice messages. Text and voice messages are kept in a simple in‑memory session to maintain conversation context.

### Features
- **Text chat**: Uses OpenAI `gpt-3.5-turbo` with conversational context
- **Voice to text**: Downloads OGG voice notes, converts to MP3 via FFmpeg, transcribes with OpenAI `whisper-1`
- **Commands**: `/start` and `/new` reset the session

### Tech stack
- Node.js (ES modules)
- Telegraf (Telegram bot framework)
- OpenAI API (Chat + Whisper)
- fluent-ffmpeg + @ffmpeg-installer/ffmpeg
- node-config for configuration

### Prerequisites
- Node.js 16+ (Docker uses `node:16-alpine`)
- Telegram bot token from BotFather
- OpenAI API key

### Quick start (local)
1) Install dependencies
```bash
npm ci
```

2) Configure credentials (choose one):
- Create `config/default.json`:
```json
{
  "TELEGRAM_TOKEN": "<your-telegram-bot-token>",
  "OPENAI_KEY": "<your-openai-api-key>"
}
```

- Or set `NODE_CONFIG` env var:
```bash
export NODE_CONFIG='{"TELEGRAM_TOKEN":"<telegram-token>","OPENAI_KEY":"<openai-key>"}'
```

3) Run the bot
```bash
# Development (nodemon)
npm run dev

# Production
npm start
```

Start a chat with your bot in Telegram and send text or a voice note.

### Docker
Build and run using the included Makefile:
```bash
make build
make run
```

Notes:
- The bot uses long polling; exposing port 3000 is optional and not required for polling mode.
- Provide configuration to the container by mounting the `config` directory or using `NODE_CONFIG`:
```bash
# Mount local config directory
docker run -d --name zsgptbot --rm \
  -v "$(pwd)/config:/app/config" \
  zsgptbot

# Or pass NODE_CONFIG inline
docker run -d --name zsgptbot --rm \
  -e NODE_CONFIG='{"TELEGRAM_TOKEN":"<telegram>","OPENAI_KEY":"<openai>"}' \
  zsgptbot
```

### Usage
- `/start` or `/new`: reset the conversation session
- Send text: the bot replies using ChatGPT
- Send a voice note: the bot transcribes it, replies with the text, then continues the conversation

The default bot replies include some Russian phrases such as "Жду вашего сообщения" and "Жду ответ сервера"; you can change these in `src/main.js`.

### Project structure
```
src/
  main.js       # Telegraf bot setup and handlers
  ogg.js        # OGG download + MP3 conversion with FFmpeg
  openai.js     # OpenAI chat + transcription wrapper
  utils.js      # Helpers (e.g., removeFile)
voices/         # Temporary audio files (kept in repo to ensure directory exists)
config/         # Place configuration files here (e.g., default.json)
Dockerfile
Makefile
package.json
```

### Configuration reference
- **TELEGRAM_TOKEN**: Telegram bot token from BotFather
- **OPENAI_KEY**: OpenAI API key

These are loaded via `node-config`. Prefer `config/default.json` for local dev; in prod, you can also use `NODE_CONFIG`.

### Customization
- Chat model: change `model` in `src/openai.js` (default `gpt-3.5-turbo`)
- Whisper model: change `whisper-1` in `src/openai.js`
- Voice length limit: `src/ogg.js` uses `-t 30` (first 30 seconds). Adjust or remove as needed.
- Language/messages: update user-facing strings in `src/main.js`.

### Troubleshooting
- Telegraf polling failures: verify `TELEGRAM_TOKEN` and that the bot is not set to webhook mode.
- OpenAI 401/429 errors: check `OPENAI_KEY`, billing status, and rate limits.
- FFmpeg errors: the project uses `@ffmpeg-installer/ffmpeg`; ensure the binary path is set (handled in `src/ogg.js`).
- Accumulated MP3 files: OGG files are deleted after conversion; MP3 files remain for transcription. You may want to add a cleanup step if disk usage grows.

### Security and privacy
All user messages and voice transcriptions are sent to OpenAI. Review your data handling policies before deploying to production.

### License
ISC (see `package.json`).

### Contributing
- Fork the repo and create a feature branch
- Keep changes focused and small; add tests or examples when relevant
- Run locally with `npm run dev` and confirm both text and voice flows
- Do not commit secrets; `config/default.json` is gitignored by default
- Open a PR describing the change and any user‑visible impacts

