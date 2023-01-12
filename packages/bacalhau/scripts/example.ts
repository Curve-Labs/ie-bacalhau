import { Contribution } from "../scripts/interfaces";

export function impactEvaluatorFunction(contributions: Array<Contribution>) {
  console.log("Example Impact Evaluator Function");
  return contributions.map((contribution) => ({
    contributor: contribution.contributor,
    shares: contribution.shares * 100,
  }));
}
