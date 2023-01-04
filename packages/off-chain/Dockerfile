FROM node:lts
WORKDIR .
COPY . .
RUN yarn install --production
CMD ["yarn", "execute"]
