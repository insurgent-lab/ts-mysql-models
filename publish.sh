rm -rf ./build
tsc
cd build
rm -rf test*
cd ..
cp package.json build/package.json
cp README.md build/README.md
cd build
npm publish --access public