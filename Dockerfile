# Use an official Node runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Build the Next.js app
RUN npm run build

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app when the container launches
CMD ["npm", "start"]
