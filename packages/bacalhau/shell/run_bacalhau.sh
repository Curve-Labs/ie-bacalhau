# shell script to run docker image on bacalhau
# Accept Docker Username
echo "Enter Docker Hub Username"
read DOCKER_NAME

# Accept Docker Image Name
echo "Enter Docker Image Name"
read IMAGE_NAME
# get latest Docker Image digest
IMAGE_INFO=$(curl -X 'GET' https://hub.docker.com/v2/namespaces/${DOCKER_NAME}/repositories/${IMAGE_NAME}/tags/latest)
LATEST_DOCKER_IMAGE_DIGEST=`awk -F',"digest":"|","os"' '{print $2}' <<< "$IMAGE_INFO"`

# Constants
DOCKER_IMAGE=${DOCKER_NAME}/$IMAGE_NAME@$LATEST_DOCKER_IMAGE_DIGEST
DEFAULT_HTTPS_URL=https://nftstorage.link/ipfs/bafybeihjfez2hb2i2bdpwkegxopzu6teqmgwnbxqhukjl7brmgwppipnwa
DEFAULT_IPFS_CID=bafybeihjfez2hb2i2bdpwkegxopzu6teqmgwnbxqhukjl7brmgwppipnwa
OUTPUT_FOLDER=results

# create results directory
mkdir ./$OUTPUT_FOLDER

echo "Running docker image $DOCKER_IMAGE on bacalhau"

echo ""

# Ask if Input needs to be given
echo "Provide inputs using (Not Case Sensitive) 
A) IPFS 
B) HTTPs 
C) No Input to Bacalhau
D) Use default HTTPs Input 
E) Use default IPFS Input"
read INPUT_URL_TYPE
echo ""

echo "Running Docker image on Bacalhau"
if [ $INPUT_URL_TYPE == "A" -o $INPUT_URL_TYPE == "a" ]
then
   # Read Input URL (HTTPS)
    echo "Provide IPFS Input:"
    read INPUT_CID
    echo "Running Docker Image on Bacalhau..."
    JOB_OUTPUT=`bacalhau docker run --inputs $INPUT_CID $DOCKER_IMAGE`
elif [ $INPUT_URL_TYPE == "B" -o $INPUT_URL_TYPE == "b" ]
then
   # Read Input URL (HTTPS)
    echo "Provide HTTPs Input:"
    read INPUT_HTTPS_URL
    echo "Running Docker Image on Bacalhau..."
    JOB_OUTPUT=`bacalhau docker run -u $INPUT_HTTPS_URL/data.json -u $INPUT_HTTPS_URL/trustedSeed.json $DOCKER_IMAGE`
elif [ $INPUT_URL_TYPE == "C" -o $INPUT_URL_TYPE == "c" ]
then
   # Run docker image with no input
   echo "No Input"
   echo "Running Docker Image on Bacalhau..."
   JOB_OUTPUT=$(bacalhau docker run $DOCKER_IMAGE)
elif [ $INPUT_URL_TYPE == "D" -o $INPUT_URL_TYPE == "d" ]
then
   # Run docker image with default HTTPs input
   echo "Default HTTPs Input"
   echo "Running Docker Image on Bacalhau..."
   JOB_OUTPUT=`bacalhau docker run -u $DEFAULT_HTTPS_URL/data.json -u $DEFAULT_HTTPS_URL/trustedSeed.json $DOCKER_IMAGE`
elif [ $INPUT_URL_TYPE == "E" -o $INPUT_URL_TYPE == "e" ]
then
   # run docker image with default IPFS input
   echo "Default IPFS Input"
   echo "Running Docker Image on Bacalhau..."
   JOB_OUTPUT=`bacalhau docker run --inputs $DEFAULT_IPFS_CID $DOCKER_IMAGE`
else
   # Invalid Input
   echo "Invalid Input"
fi

# log output of Job
echo $JOB_OUTPUT

# Retrieve JOB ID from the JOB output
JOB_ID=`awk -F'Job ID: | Checking job' '{print $2}' <<< "$JOB_OUTPUT"`

# Clear results folder
# This is a dangerous operation, need to consider all the edge cases like
# 1. running from different directory
# 2. error in relative directory
# echo "Do you want to empty Results directory before downloading results"
# echo "y | Y - to clear results directory"
# echo "Hit enter to skip"
# read CLEAR_DIRECTORY

# if [ $CLEAR_DIRECTORY == "Y" -o $CLEAR_DIRECTORY == "y" ]
# then
#    # clear directory
#    echo "Clearing result directory"
#    rm -rv ./$OUTPUT_FOLDER/*
# else
#     # by Default skipping
#     echo "Not clearing result directory"
# fi


# get results
echo $JOB_ID
echo "Fetching Results"

# Generating short ID of JOB
JOB_SHORT_ID=$(cut -d "-" -f 1 <<< $JOB_ID)
RESULT_FOLDER="Result_$JOB_SHORT_ID"
mkdir ./$OUTPUT_FOLDER/$RESULT_FOLDER
echo $JOB_SHORT_ID

OUTPUT_PATH=./$OUTPUT_FOLDER/$RESULT_FOLDER/Result-$JOB_SHORT_ID.json

# fetch results and store
bacalhau get $JOB_ID --output-dir ./$OUTPUT_FOLDER/$RESULT_FOLDER

#  result via API to get the CID where result is stored
curl -X 'POST' \
  'http://bootstrap.production.bacalhau.org:1234/results' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "job_id": "'"${JOB_ID}"'"
}' >> ./$OUTPUT_PATH

# going back to root
cd ../..

# Format output
yarn prettier -w ./packages/bacalhau/$OUTPUT_FOLDER/$RESULT_FOLDER

# going back to bacalhau directory
cd ./packages/bacalhau
