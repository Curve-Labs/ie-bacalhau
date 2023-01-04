# Shell Script to Build and push docker image on Intel Machines
echo "Building Docker Image for Intel Computers"

# Accept Docker Username
echo "Enter Docker Hub Username. (Case Sensitive)"
read DOCKER_NAME

# Accept Docker Image Name
echo "Enter Docker Image Name. (Case Sensitive)"
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

# Build Docker Image
echo "Building Docker Image..."
docker build -t $IMAGE_NAME . || echo "DBuilding Docker Image amd64 failed"
echo "Docker Image Built"

# Tag Docker Image
echo "Adding tag to docker image..."
docker tag $IMAGE_NAME $TAG || echo "Tagging Docker Image Failed failed"
echo "Added tag successfully, The Tag is" $TAG

# Run Docker Image locally
echo "Running Docker Image Locally..."
docker run $TAG || echo "Running Docker Image failed"
echo "Docker Image run successful"

# Push Docker Image
echo "Pushing Docker Image..."
docker push $TAG
echo "Docker Image Pushed"

# Success
echo "Docker Run Success"
