A gcode preview renderer for WebGL and the desktop.

### Running the Web Example
1. Copy a gcode file to `./example/example.gcode`
2. `wasm-pack build --target web --out-name web --out-dir ./pkg`
3. `cd example && rm -rf .parcel-cache/ && yarn parcel index.html`

### Running the Desktop Example

`cargo run --release /path/to/file.gcode`
