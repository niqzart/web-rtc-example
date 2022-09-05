FROM node:16-alpine AS builder

# Alpine doesn't come with openssh or git, install them
RUN apk add --no-cache openssh-client git

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
COPY ./package*.json ./

# Install all dependencies (with dev ones)
RUN npm install

# Copy all files
COPY ./ ./

# Build app
RUN npm run build


# Base on offical Node.js Alpine image
FROM node:16-alpine

# Alpine doesn't come with openssh or git, install them
RUN apk add --no-cache openssh-client git

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
COPY ./package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Get the built application from the first stage
COPY --from=builder /app/dist/ ./

# Expose the listening port
EXPOSE 5000

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run npm start script when container starts
CMD [ "node", "server.js" ]
