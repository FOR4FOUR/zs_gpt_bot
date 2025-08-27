FROM node:18-alpine AS base

WORKDIR /app

# Install ffmpeg from Alpine repositories instead of bundling @ffmpeg-installer
RUN apk add --no-cache ffmpeg

FROM base AS deps
COPY package*.json ./
# Install only production dependencies for smaller runtime
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

ENV PORT=3000
EXPOSE $PORT
RUN mkdir -p /app/voices
CMD ["npm", "start"]