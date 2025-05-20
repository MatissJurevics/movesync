# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxt

# Copy built application from build stage
COPY --from=build --chown=nuxt:nodejs /app/.output /app/.output
COPY --from=build --chown=nuxt:nodejs /app/.nuxt /app/.nuxt
COPY --from=build --chown=nuxt:nodejs /app/package.json /app/package.json

# Switch to non-root user
USER nuxt

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"] 