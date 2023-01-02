FROM node
WORKDIR .
COPY . .
RUN yarn install --production
CMD ["yarn ts-node", "scripts/index.js"]
