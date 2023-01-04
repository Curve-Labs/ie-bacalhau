# Shell script to build and push Docker Images on Apple Silicone machines
echo "Building Docker Image for Apple Silicone Computers"

# Accept Docker Username
echo "Enter Docker Hub Username"
read DOCKER_NAME

# Accept Docker Image Name
echo "Enter Docker Image Name"
read IMAGE_NAME

# generating tag
TAG=$DOCKER_NAME/$IMAGE_NAME

echo "Docker Image will be pushed to repo:" $TAG

# Yarn install
echo "Running yarn install in case it's pending"
yarn install || echo "Yarn install failed"

# Compile Typescript Files
echo "Compiling typescript files."
yarn compile || echo "Compiling TS files failed"
echo "Typescript files compiled."

# Build Docker Image and push
echo "Building and Pushing Docker Image..."
docker buildx build --platform linux/amd64 --push -t $TAG . || echo "Building Docker Image amd64 failed"
echo "Docker Image Built and Pushed"

# Pull Docker Image
echo "Pulling Docker Image..."
docker pull $TAG || echo "Pulling Docker Image failed"
echo "Docker Image pulled"

# Run Docker Image Locally
echo "Running Docker Image locally..."
docker run $TAG || echo "Running Docker Image failed"
echo "Docker Run Successful"
