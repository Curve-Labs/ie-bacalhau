import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const getMerkleTree = (
  values: string[][]
): StandardMerkleTree<string[]> => {
  const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

  return tree;
};
