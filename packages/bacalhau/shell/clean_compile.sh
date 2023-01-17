# Shell script to remove all the compiled javascript files

echo "Removing compile Javascript files before reunning TypeScript Files"

# only remove javascript files from directories
rm -rf ./*/*.js

echo "Compiled JS files removed"
