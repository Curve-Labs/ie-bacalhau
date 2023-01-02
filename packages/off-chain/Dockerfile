FROM node
WORKDIR .
COPY . .
RUN yarn install --production
CMD ["node", "scripts/index.js"]
