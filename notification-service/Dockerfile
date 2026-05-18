# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment
ENV NODE_ENV=development

# Copy dependency files
COPY notification-service/package*.json ./

# Install dependencies (including dev → nodemon)
RUN npm install

# Copy notification service source code
COPY notification-service ./

# Copy shared proto files
COPY proto ./proto

# Expose API port
EXPOSE 50051

# Run dev script (nodemon)
CMD ["npm", "run", "dev"]