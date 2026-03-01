# build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm install

# copy source code
COPY . .
# angular dist/<project-name>/browser
RUN npm run build -- --configuration=production

# Run Stage
FROM nginx:alpine

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# check angular.json "outputPath"，
COPY --from=build /usr/src/app/dist/food-ordering-app/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]