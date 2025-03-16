# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Add registry configuration and cache cleaning
RUN npm config set registry https://registry.npmjs.org/ && npm cache clean --force

# Copy package.json and install dependencies
COPY package.json ./

# Clean install with network timeout extension
RUN npm install --legacy-peer-deps --fetch-timeout=300000

# Copy the rest of the frontend app
COPY . .

# Expose port 3000 (or your frontend's port)
EXPOSE 3000

# Start the frontend app
CMD ["npm", "start"]
