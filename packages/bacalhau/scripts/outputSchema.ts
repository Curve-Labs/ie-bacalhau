interface FailedOutput {
  success: boolean;
  reason: string;
  error: string;
}

interface SuccessOutput {
  success: boolean;
  merkleRoot: string;
  rewards: any;
}

export const failedOutput = (error: string, reason: string): FailedOutput => {
  return {
    success: false,
    reason: reason,
    error: error,
  };
};

export const successOutput = (
  merkleRoot: string,
  rawData: string
): SuccessOutput => {
  return {
    success: true,
    merkleRoot: merkleRoot,
    rewards: rawData,
  };
};
