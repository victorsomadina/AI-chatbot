FROM node:alpine AS build
WORKDIR  /app

# Copy package.json and package-lock.json
COPY package.json .
COPY package-lock.json .


# Install dependencies
RUN npm install

# Copy all files
COPY . .

EXPOSE 3900

# cmd to run the docker container
CMD [ "npm",  "run", "dev" ]