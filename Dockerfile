FROM node:18-alpine

WORKDIR /app

# Copy application files
COPY . .

# Install dependencies and build
RUN npm install && npm run dev --host

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"] 