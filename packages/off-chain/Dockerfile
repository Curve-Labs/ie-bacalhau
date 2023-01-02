FROM node:lts
WORKDIR /usr/src/app
COPY . .
RUN yarn install --production
CMD ["yarn", "execute"]
