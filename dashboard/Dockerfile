FROM node:18-alpine as build
WORKDIR /app
COPY ./package.json ./
RUN yarn install
COPY . ./
RUN yarn build
# prod env
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/deploy/nginx/nginx.config /etc/nginx/conf.d/default.conf
EXPOSE 3000
ENTRYPOINT ["nginx", "-g", "daemon off;"]