# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment
ENV NODE_ENV=development

# Copy dependency files
COPY notification-worker/package*.json ./

# Install dependencies (including dev → nodemon)
RUN npm install

# Copy nofication worker source code
COPY notification-worker ./

# Copy shared proto files
COPY proto ./proto

# No EXPOSE (worker)

# Run dev script (nodemon)
CMD ["npm", "run", "dev"]