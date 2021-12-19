wasm-pack build --target web --out-name web --out-dir ./pkg
cd ./example
echo `pwd`
rm -rf .parcel-cache/ && yarn parcel index.html
