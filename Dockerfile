# Use Node.js 16 official image as the base image
FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Install necessary dependencies to run Puppeteer in a Docker container
RUN apt-get update -q && \
    apt-get install -y wget ca-certificates libxss1 --no-install-recommends

RUN apt-get install -y chromium --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD [ "node", "server.js" ]
