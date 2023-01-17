# Shell script to copy merkle tree file from hardhat package
FILE_NAME="merkleTree.ts"
SOURCE_PACKAGE="on-chain"
SOURCE="../$SOURCE_PACKAGE/utils/$FILE_NAME"
DEST_DIR="./utils/"
DEST="./utils/$FILE_NAME"

# Check if the directory exists or not
if [ -d "$DEST_DIR" ]; then
   echo "'$DEST_DIR' found and now copying files, please wait ..."
else
   echo "Warning: '$DEST_DIR' NOT found. Creating new directory."
   mkdir $DEST_DIR
fi

# Copy file
cp -v $SOURCE $DEST

echo "File copied"
