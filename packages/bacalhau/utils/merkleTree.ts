import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// example input vor `values`:
// [["0x1234...", "100"], ["0x5678...", "200"]]
export const getMerkleTree = (
  values: string[][]
): StandardMerkleTree<string[]> => {
  const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

  return tree;
};
