# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the info port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]
