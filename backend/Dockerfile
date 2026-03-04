FROM node:20-alpine

# 建构工具
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# 1. copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# 2. copy source code
COPY . .

# 3. uplaods 
RUN mkdir -p uploads

EXPOSE 3000

# 4. start the server
CMD ["node", "src/app.js"]