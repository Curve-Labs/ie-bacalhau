// @ts-ignore

export function impactEvaluatorFunction(
  dataList: any,
  trustedSeedList: any,
  previousRewards: string,
  extraData: Array<any> | undefined = undefined
): any {
  console.log("Production Impact Evaluator Function");
  dataList.forEach((data: any) => {
    const keys = Object.keys(data.data);
    for (const key of keys) {
      data.data[key] = data.data[key] * 100;
    }
  });
  let result = {
    newRewards: dataList.reduce(
      (output: any, data: any) => ({ ...output, ...data.data }),
      {}
    ),
    newTrustSeed: trustedSeedList.reduce(
      (output: any, t: any) => [...output, ...t],
      []
    ),
  };
  return result;
}
