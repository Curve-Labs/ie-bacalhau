FROM mihirsinhparmar/bacalhau-ie
WORKDIR .
COPY /ImpactEvaluator/ImpactEvaluatorFunction.js /ImpactEvaluator/
RUN yarn install --production
CMD ["yarn", "execute"]
