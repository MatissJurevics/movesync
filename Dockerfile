FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with legacy peer deps to handle conflicts
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build the application for production
RUN npm run build

# Expose port
EXPOSE 3000

# Start the production server
CMD ["node", ".output/server/index.mjs"] 