# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend app
COPY . .

# Expose port 3000 (or your frontend's port)
EXPOSE 3000

# Start the frontend app
CMD ["npm", "start"]
