# Use a lightweight Node.js base image (Alpine variant)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install git for bower and other build tools
RUN apk add --no-cache git python3 make g++

# Copy dependency definitions
COPY package*.json ./
COPY bower.json ./
COPY .bowerrc ./

# Install npm dependencies
RUN npm install

# Install networking tools (ping, ip, etc.)
RUN apk add --no-cache \
    iputils \
    iproute2 \
    net-tools \
    bind-tools

# Copy the rest of the application code
COPY . .

# Expose the port your app will use (can be overridden in docker-compose)
EXPOSE 8080

# Default command to run the application
CMD ["npm", "start"]