# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies (skip devDependencies in production)
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the app port
EXPOSE 8000

# Start the app
CMD ["node", "server.js"]