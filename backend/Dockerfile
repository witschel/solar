FROM node:18-alpine as build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
ENV NODE_ENV=production
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build
RUN npm prune --production

FROM node:18-alpine as production
ARG PORT
ENV PORT=$PORT
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/node_modules ./node_modules
CMD [ "node", "./build/index.js" ]