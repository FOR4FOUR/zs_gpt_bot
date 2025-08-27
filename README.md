# Telegram GPT Voice Bot

A Node.js Telegram bot that converts voice messages to text using OpenAI Whisper, chats via GPT-3.5, and replies back in chat. Includes audio conversion from OGG to MP3 via FFmpeg and supports Docker deployment.

## Features
- Voice message transcription with OpenAI Whisper (`whisper-1`)
- Conversational replies using Chat Completions (`gpt-3.5-turbo`)
- OGG ➜ MP3 conversion via `fluent-ffmpeg` and `@ffmpeg-installer/ffmpeg`
- Session-based conversation history per user
- Dockerfile and Makefile for easy containerized deployment

## Tech Stack
- Node.js 16 (ES Modules)
- Telegraf (Telegram Bot API)
- OpenAI SDK
- Axios, Config
- FFmpeg (bundled using `@ffmpeg-installer/ffmpeg`)

## Prerequisites
- Node.js 16+
- An OpenAI API key
- A Telegram Bot token (from @BotFather)
- Docker (optional, for containerized runs)

## Configuration
Configuration is managed using the `config` package. Provide the following keys:

- `TELEGRAM_TOKEN`: Telegram bot token
- `OPENAI_KEY`: OpenAI API key

You can supply these via environment variables or a `config` file. Common options:

1) Environment variables (recommended):
```bash
export TELEGRAM_TOKEN="<your_telegram_token>"
export OPENAI_KEY="<your_openai_api_key>"
```

2) Config files (for local dev): create `config/default.json` or `config/production.json`:
```json
{
  "TELEGRAM_TOKEN": "<your_telegram_token>",
  "OPENAI_KEY": "<your_openai_api_key>"
}
```

## Installation
```bash
npm ci
```

## Running Locally
- Development (auto-restart with nodemon):
```bash
npm run dev
```
- Production:
```bash
npm start
```

## Running with Docker
Build image:
```bash
make build
```
Run container (maps port 3000):
```bash
make run
```
Ensure the container has access to required env vars. Example:
```bash
docker run -d \
  -e TELEGRAM_TOKEN="$TELEGRAM_TOKEN" \
  -e OPENAI_KEY="$OPENAI_KEY" \
  -p 3000:3000 \
  --name zsgptbot --rm zsgptbot
```

## Usage
- Add your bot on Telegram and send either text or a voice message
- For a new conversation, use `/new` or `/start`
- The bot will:
  - Download voice message OGG
  - Convert to MP3 (up to 30s)
  - Transcribe with Whisper
  - Send the recognized text back
  - Forward the conversation to GPT-3.5 and reply

## Project Structure
```
src/
  main.js       # Telegraf bot, session handling, command and message handlers
  ogg.js        # OGG download and MP3 conversion via FFmpeg
  openai.js     # OpenAI chat and transcription wrappers
  utils.js      # Helper to remove temp files
config/
  default.json  # (optional) config file with TELEGRAM_TOKEN, OPENAI_KEY
voices/         # Temporary audio files (OGG/MP3)
Dockerfile
Makefile
```

## Environment Variables
- `TELEGRAM_TOKEN` (required)
- `OPENAI_KEY` (required)
- `PORT` (default 3000; exposed in Dockerfile)

## Notes
- Audio conversion trims to 30 seconds via FFmpeg (`-t 30`). Adjust as needed in `src/ogg.js`.
- Ensure `voices/` directory exists and the process has write permissions (this repo includes it). The converter writes and cleans up files using `removeFile`.

## Troubleshooting
- Missing FFmpeg: The project uses `@ffmpeg-installer/ffmpeg` to bundle FFmpeg. If conversion fails, verify the binary path is set by `fluent-ffmpeg` in `src/ogg.js`.
- OpenAI errors: Check `OPENAI_KEY` and API availability/quotas.
- Telegram errors: Verify `TELEGRAM_TOKEN` and that the bot is started with `/start` in chat.

## License
ISC

## Contributing
- Fork, create a feature branch, and open a PR
- Follow conventional, readable code style and add minimal, focused changes