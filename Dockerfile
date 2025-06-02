FROM node:18-alpine

WORKDIR /app

# Copy application files
COPY . .

# Install dependencies and build
RUN npm install --legacy-peer-deps && npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"] 