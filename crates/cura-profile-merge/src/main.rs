use std::{fs, path::{Path, PathBuf}, collections::HashMap};

use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};

#[derive(Deserialize, Serialize, Debug)]
struct CuraDef {
    name: String,
    version: u64,
    #[serde(default)]
    inherits: Option<String>,
    #[serde(default)]
    metadata: Map<String, Value>,
    #[serde(default)]
    settings: HashMap<String, CuraSettingsCategory>,
    #[serde(default)]
    overrides: HashMap<String, CuraSetting>,
}

#[derive(Deserialize, Serialize, Debug)]
struct CuraSettingsCategory {
    children: HashMap<String, CuraSetting>,
    #[serde(flatten)]
    extra: Map<String, Value>,
}

type CuraSetting = Map<String, Value>;

fn main() {
    let mut args = std::env::args().skip(1);
    if args.len() != 2 {
        panic!(
            "Expected useage: cura-profile-merge /path/to/settings.def.json /output/path.def.json"
        );
    }

    let input_path = PathBuf::from(args.next().unwrap());
    let output_path = PathBuf::from(args.next().unwrap());

    let resources_dir = input_path
        .ancestors()
        .skip(2)
        .next()
        .unwrap()
        .to_owned();

    // Create the merged printer def
    eprintln!("\nCreating Printer Def");
    eprintln!("==============================================================");

    let printer_def = create_merged_cura_def(
        &resources_dir,
        &input_path,
        &output_path.join("merged.def.json"),
    );

    // Create merged defs for each extruder
    let extruders = printer_def.metadata["machine_extruder_trains"].clone();
    let extruders: HashMap<String, String> = serde_json::from_value(extruders).unwrap();

    for (_, extruder) in extruders {
        eprintln!("\nCreating Extruder Def: {:?}", extruder);
        eprintln!("==============================================================");

        let extruder_filename = format!("{}.def.json", extruder);

        create_merged_cura_def(
            &resources_dir,
            &resources_dir.join("extruders").join(&extruder_filename),
            &output_path.join(extruder_filename),
        );
    }
}

fn create_merged_cura_def<P1: AsRef<Path>, P2: AsRef<Path>>(
    resources_dir: P1,
    input_path: P2,
    output_path: P2,
) -> CuraDef {
    let mut defs = load_parent_defs(
        resources_dir,
        input_path,
    );

    // Start from the root def and apply over overrides till we reach the leaf
    let mut working_copy = defs.pop().unwrap();
    defs.reverse();

    let base_name = working_copy.name.clone();
    eprintln!("Root: {:?}", base_name);

    for def in defs {
        eprintln!("Applying Override: {:?}", def.name);
        // Merge metadata
        merge_json(&mut working_copy.metadata, &def.metadata);
        // Apply overrides
        for (k, setting_override) in def.overrides {
            let setting = working_copy.settings
                .iter_mut()
                .find_map(|(_, settings_category)| {
                    settings_category.children.iter_mut().find(|(k2,_)| **k2 == k)
                });

            let setting = if let
                Some((_, setting)) = setting
            {
                setting
            } else {
                eprintln!(
                    "WARN: Override in {:?} does not match a setting in {:?} (ignoring): {:?}",
                    def.name,
                    base_name,
                    k,
                );
                continue;
            };

            merge_json(setting, &setting_override)
        }
    }

    let json = serde_json::to_string_pretty(&working_copy).unwrap();
    fs::write(output_path, json).unwrap();

    working_copy
}

fn load_parent_defs<P1: AsRef<Path>, P2: AsRef<Path>>(
    resources_dir: P1,
    input_def_path: P2,
) -> Vec<CuraDef>{
    let input_def_path = input_def_path.as_ref().to_owned();
    let resources_dir = resources_dir.as_ref().to_owned();

    let mut next_def_path = Some(input_def_path);
    let mut defs: Vec<CuraDef> = vec![];

    while let Some(def_path) = next_def_path {
        let content = &fs::read_to_string(&def_path)
            .expect(&format!("Read {:?}", def_path));

        let def: CuraDef = serde_json::from_str(content).unwrap();

        next_def_path = def.inherits.as_ref().map(|inherits| {
            ["definitions", "extruders"]
                .iter()
                .map(|dir| {
                    resources_dir
                        .join(dir)
                        .join(format!("{}.def.json", inherits))
                })
                .find(|p| p.exists())
                .expect(&format!("Find parent def file: {:?}", inherits))
        });


        defs.push(def);
    }

    defs
}

fn merge_json(a: &mut Map<String, Value>, b: &Map<String, Value>) {
    for (k, v) in b {
        a.insert(k.clone(), v.clone());
    }
}
