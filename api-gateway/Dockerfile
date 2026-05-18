# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment
ENV NODE_ENV=development

# Copy dependency files
COPY api-gateway/package*.json ./

# Install dependencies (including dev → nodemon)
RUN npm install

# Copy API Gateway source code
COPY api-gateway ./

# Copy shared proto files
COPY proto ./proto

# Expose API port
EXPOSE 3000

# Run dev script (nodemon)
CMD ["npm", "run", "dev"]