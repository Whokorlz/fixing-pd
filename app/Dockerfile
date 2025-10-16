# 1. Use the official Node.js image as the base
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application source code (including the compiled 'dist' folder later)
COPY . .

# 6. Build the TypeScript application (required before running the 'start' script)
# Ensure you have 'npm run build' defined in package.json (tsc)
RUN npm run build

# 7. Expose the port where the application will run (from .env or default 3000)
EXPOSE 3000

# 8. Define the command to run the application in production mode
# This uses the 'start' script defined in package.json (node dist/index.js)
CMD [ "npm", "start" ]

# Note: For local development, we will use docker-compose to run the 'dev' script.