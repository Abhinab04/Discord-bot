FROM ghcr.io/puppeteer/puppeteer:22.9.0 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port if needed (e.g., for a web server)
EXPOSE 3000

# Command to run your app
CMD ["node", "app.js"]