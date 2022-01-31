use serde::Deserialize;
use three_d::*;
use std::io::Cursor;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ExportSTLOptions {
    pub transform: Mat4,
}

use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = exportSTL)]
pub fn export_stl_wasm(original_stl: Vec<u8>, options: &JsValue) -> Vec<u8> {
    let options: ExportSTLOptions = options.into_serde().expect("Invalid exportSTL options");

    export_stl(original_stl, options)
}

pub fn export_stl(original_stl: Vec<u8>, options: ExportSTLOptions) -> Vec<u8> {
    let ExportSTLOptions {
        transform,
    } = options;

    let mut reader = Cursor::new(&original_stl[..]);
    let mesh = nom_stl::parse_stl(&mut reader).unwrap();
    let vertices: Vec<_> = mesh.vertices_ref().collect();

    // let transform =  1.0
    //     * Mat4::from_translation(self.position_with_offset())
    //     * Mat4::from(self.rotation_mat3(false))
    //     * Mat4::from_nonuniform_scale(self.scale.x, self.scale.y, self.scale.z);

    let triangle_count = vertices.len() / 3;
    let mut content: Vec<u8> = Vec::with_capacity(triangle_count * 50 + 84);

    // Header [80 Bytes]
    content.append(&mut vec![0; 80]);

    // Number of Triangles [4 Bytes]
    for byte in (triangle_count as u32).to_le_bytes() {
        content.push(byte);
    }

    // Triangles [50 Bytes Per Triangle]
    for triangle in mesh.triangles() {
        // Normals
        for byte in triangle.normal()
            .into_iter()
            .flat_map(|f| f.to_le_bytes())
        {
            content.push(byte);
        }

        // Verticies
        for v in triangle.vertices() {
            let v = (transform
                * vec4(
                    v[0],
                    v[1],
                    v[2],
                    1.0,
                ))
                .truncate();

            for byte in [v.x, v.y, v.z]
                .into_iter()
                .flat_map(|f| f.to_le_bytes())
            {
                content.push(byte);
            }
        }

        // Attribute byte count [2 Bytes]
        content.append(&mut vec![0; 2]);
    };

    content
}
