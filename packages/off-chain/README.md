# off-chain

## Links
Docker Image: mihirsinhparmar/ie-bac

Run job on bacalhau without inputs
```
bacalhau docker run mihirsinhparmar/bacalhau-ie
```

Run job with inputs using HTTPs
```
bacalhau docker run --input-urls https://nftstorage.link/ipfs/bafybeiblg4ymbxuhpckcsfkdhn52o4l4iakc6wgjptp4fil4ctjcvdsvp4 mihirsinhparmar/bacalhau-ie
```

# Easy Build
A shell script is crated to help with easy build and push of Docker Images
To build docker image using following command:
```sh
yarn build
```
This will prompt to select the type of CPU you use,
Either select A or B.

Once selected, follow the prompts and script will handle the following:
1. Install Dependencies if packages are not installed.
2. Compile TypeScript Files.
3. Build Docker Image
4. Run Docker Image locally
5. Push Docker Image

# Manual Build
## Step 1. Compile TypeScript Files
The code is written in typescript and it needs to be compile and converted first.
To compile, use following command
```
yarn compile
```

The compiled files will be stored in `./scripts`.


## Step 2. Build Docker Image
Bacalhau requires the Docker image to be x86 (amd64) architecture.

Build docker image using this command
```sh
docker build -t NAME .
```

### Step 2.5 Test Docker image
```sh
docker run NAME
```

### Step 3. Push docker image
Add a tag to docker image
Push the docker container

### Step 4. Run Docker image on Bacalhau

## IMPORTANT! If you are using Apple Silicone (M1, M2, ...) Machines
If you are on Apple Silicon machine use this script to build Docker Image
```sh
docker buildx build --platform linux/amd64 --push -t USERNAME/NAME .
```
where USERNAME is your docker hub username
and, NAME is the name of docker image

## Note
### Bacalhau caching Docker Images
Bacalhau might cache the docker image and hence it might take some time for bacalhau to pick up latest docker image.
Sometimes if you run newly deployed docker image, bacalhau might still run an old version of docker image.

### Waiting to pin files on Filecoin
New files pinned to IPFS are not directly added to Filecoin. It takes some time for those files to be added to filecoin. Meanwhile the filecoin deals are been made, you can use HTTPs urls as input files.
to do that use following command:
```
bacalhau docker run --input-urls $URL $DOCKER_IMAGE
``` 


## Run Docker Images on Bacalhau
```
export CID=PLAIN_IPFS_CID
```
```
bacalhau docker run -v $CID:/inputs USERNAME/NAME
```

