FROM node:14.16.0

WORKDIR /usr/src/app

ARG NODE_ENV="production"
ENV NODE_ENV="production"

RUN mkdir -p /usr/src/app

COPY . /usr/src/app

RUN npm ci \
  && npm run build-prod

EXPOSE 3000

CMD [ "node", "/usr/src/app/dist/index" ]
