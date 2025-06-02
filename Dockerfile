FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy application files
COPY . .

# Build the application for production
RUN bun run build

# Expose port
EXPOSE 3000

# Start the production server
CMD ["bun", "run", ".output/server/index.mjs"]