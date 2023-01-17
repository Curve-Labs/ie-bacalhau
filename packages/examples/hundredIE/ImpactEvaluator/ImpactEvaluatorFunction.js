"use strict";
// @ts-ignore
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactEvaluatorFunction = void 0;
function impactEvaluatorFunction(dataList, trustedSeedList, previousRewards, extraData = undefined) {
    console.log("Production Impact Evaluator Function");
    dataList.forEach((data) => {
        const keys = Object.keys(data.data);
        for (const key of keys) {
            data.data[key] = data.data[key] * 100;
        }
    });
    let result = {
        newRewards: dataList.reduce((output, data) => ({ ...output, ...data.data }), {}),
        newTrustSeed: trustedSeedList.reduce((output, t) => [...output, ...t], []),
    };
    return result;
}
exports.impactEvaluatorFunction = impactEvaluatorFunction;
