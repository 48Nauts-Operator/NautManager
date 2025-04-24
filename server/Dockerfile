# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source code inside Docker image 
# (We mount over this in dev using docker-compose volumes,
# but this ensures the image contains the code for potential prod use)
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "run", "start" ] 