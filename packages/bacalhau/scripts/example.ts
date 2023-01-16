// @ts-ignore
import {Address} from "ethers";
import { IEResult, InputData } from "../scripts/interfaces";

export function impactEvaluatorFunction(
  dataList: Array<InputData>,
  trustedSeedList: Array<Array<Address>>,
  previousRewards: string,
  extraData: Array<any> | undefined = undefined
): IEResult {
  console.log("Example Impact Evaluator Function");
  let result: IEResult = {
    newRewards: dataList.reduce((output,data)=>({...output, ...data.data}), {}),
    newTrustSeed: trustedSeedList.reduce((output, t)=>[...output, ...t], []),
  };
  console.log(result);
  return result;
}
