# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/watcher

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source code inside Docker image
COPY . .

# Command to run the watcher script using npm start
CMD [ "npm", "run", "start" ] 