# Shell Script to build images and push

# Ask user for input

echo "What CPU processor are you using: (A) Apple Silicone (M1, M2, ...) or (B) Intel"
echo "Enter A or B. (Not case sensitive)"
read CPU_ARCH

if [ $CPU_ARCH == "A" -o $CPU_ARCH == "a" ]
then
   sh shell/build_M1.sh
elif [ $CPU_ARCH == "B" -o $CPU_ARCH == "b" ]
then
   sh shell/build_intel.sh
else
   echo "Invalid Input"
fi
