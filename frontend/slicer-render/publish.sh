wasm-pack build --target web --out-name web --out-dir ./pkg
cd pkg
yarn publish --no-commit-hooks
