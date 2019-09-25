extern crate prost_build;

use std::env;

fn main() {
    let cargo_path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let mut protos_path = cargo_path.clone();
    // protos_path.pop();
    // protos_path.push("teg-protobufs");
    protos_path.pop();
    protos_path.pop();
    protos_path.push("protos");

    if !protos_path.as_path().exists() {
        println!("Skipping protobuf compilation");
        return
    }

    let includes  = [protos_path.to_str().unwrap()];

    let mut config = prost_build::Config::new();
    config.out_dir(cargo_path.join("src").join("protos"));

    config.compile_protos(
        &[
            protos_path.join("CombinatorMessage.proto").to_owned().to_str().unwrap(),
            protos_path.join("MachineMessage.proto").to_owned().to_str().unwrap(),
        ],
        &includes
    ).unwrap();
}

// fn main() {
//     let mut path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
//     path.pop();
//     path.push("teg-protobufs");
//     // path.push("");

//     println!("PATH {:?}", path);

//     let input = [
//         "CombinatorMessage.proto",
//         "MachineMessage.proto",
//     ];

//     let input: Vec<String> = input
//         .iter()
//         .map(|file_name| {
//             path
//                 .join(file_name)
//                 .to_str()
//                 .expect("directory path must only contain valid utf8")
//                 .to_string()
//         })
//         .collect();

// 	    input: &[
//             &input[0][..],
//             &input[1][..],
//         ],
// 	    includes: &[
//             path.to_str().expect("path must be valid utf8"),
//             // path.join("MachineMessage.proto").to_str().expect("path must be valid utf8"),
//         ],

// 	protoc_rust::run(protoc_rust::Args {
// 	    out_dir: "src/protos",
// 	    customize: Customize {
// 	      ..Default::default()
// 	    },
// 	}).expect("protoc");
// }