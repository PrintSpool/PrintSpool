use std::{fs, path::{Path, PathBuf}, collections::{BTreeMap, HashMap}};

use linked_hash_map::LinkedHashMap;
use pyo3::types::{PyDict, IntoPyDict};
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
    settings: LinkedHashMap<String, CuraSetting>,
    #[serde(default)]
    overrides: HashMap<String, CuraSetting>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct CuraSetting {
    #[serde(default)]
    value: Option<Value>,
    #[serde(default)]
    default_value: Option<Value>,
    #[serde(default, rename="type")]
    value_type: Option<CuraType>,
    /// Either a bool or an eval string is used to determine whether the setting should be enabled
    enabled: Option<Value>,
    #[serde(default)]
    children: LinkedHashMap<String, CuraSetting>,
    #[serde(flatten)]
    extra: Map<String, Value>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all="snake_case")]
enum CuraType {
    Category,
    Str,
    Bool,
    Float,
    Enum,
    Int,
    Polygon,
    Polygons,
    Extruder,
    OptionalExtruder,
    #[serde(rename="[int]")]
    IntArray,
}

fn main() {
    let mut args = std::env::args().skip(1);
    if args.len() != 2 {
        panic!(
            "Expected useage: cura-profile-merge /path/to/settings.def.json /output/path.def.json"
        );
    }

    let input_path = PathBuf::from(args.next().unwrap());
    let output_path = PathBuf::from(args.next().unwrap());
    std::fs::create_dir_all(&output_path).expect("Unable to create output directory");

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
    let extruders: BTreeMap<String, String> = serde_json::from_value(extruders).unwrap();

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

fn find_setting_mut<'a>(settings: &'a mut LinkedHashMap<String, CuraSetting>, key: &str) -> Option<&'a mut CuraSetting> {
    for (k, setting) in settings {
        if k == key {
            return Some(setting)
        }
        if let Some(child_setting) = find_setting_mut(&mut setting.children, key) {
            return Some(child_setting)
        }
    }

    None
}

fn all_settings<'a>(settings: &'a LinkedHashMap<String, CuraSetting>) -> Vec<(&'a String, &'a CuraSetting)> {
    settings
        .iter()
        .flat_map(|(k, setting)| {
            std::iter::once((k, setting))
                .chain(all_settings(&setting.children))
        })
        .collect()
}

fn all_settings_mut<'a, F>(settings: &'a mut LinkedHashMap<String, CuraSetting>, cb: &mut F)
where
    F: FnMut(&'a str, &'a mut CuraSetting) -> &'a mut CuraSetting,
{
    settings
        .iter_mut()
        .for_each(|(k, setting)| {
            let setting = cb(k, setting);
            all_settings_mut(&mut setting.children, cb);
        });
}


#[pyo3::pyfunction]
#[pyo3(name = "extruderValue")]
fn extruder_value(x: String) {
    panic!("Called extruderValue with: {:?}", x);
}

#[pyo3::pyfunction]
#[pyo3(name = "extruderValues")]
fn extruder_values(x: String) {
    panic!("Called extruderValues with: {:?}", x);
}

#[pyo3::pyfunction]
#[pyo3(name = "resolveOrValue")]
fn resolve_or_value(x: String) {
    panic!("Called resolveOrValue with: {:?}", x);
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
        working_copy.name = def.name.clone();
        working_copy.version = def.version.clone();
        merge_json(&mut working_copy.metadata, &def.metadata);
        // Apply overrides
        for (k, setting_override) in def.overrides {
            let setting = find_setting_mut(&mut working_copy.settings, &k);

            let setting = if let Some(setting) = setting {
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

            // eprintln!("Merging {}: {:?} => {:?}", k, setting_override, setting);
            merge_setting(setting, &setting_override)
        }
    }

    // Create a list of all settings that do not require evaluation for use in evalutating
    // python expressions
    use pyo3::prelude::*;

    Python::with_gil(|py| {
        let locals = [
            ("math", py.import("math").expect("Import 'math' into python")),
        ].into_py_dict(py);

        let cura_ctx = PyModule::from_code(
            py,
            "",
            "cura_formula_functions.py",
            "cura_formula_functions",
        ).expect("Define cura formula functions");

        cura_ctx.add_function(pyo3::wrap_pyfunction!(extruder_value, cura_ctx).unwrap()).unwrap();
        cura_ctx.add_function(pyo3::wrap_pyfunction!(extruder_values, cura_ctx).unwrap()).unwrap();
        cura_ctx.add_function(pyo3::wrap_pyfunction!(resolve_or_value, cura_ctx).unwrap()).unwrap();

        for symbol in [
            "extruderValue",
            "extruderValues",
            "resolveOrValue",
        ] {
            locals.set_item(symbol, cura_ctx.getattr(symbol).unwrap())
                .unwrap();
        }

        let mut settings_to_eval = 0;

        eprintln!("SETTING LENGTH: {:?}", working_copy.settings.len());
        eprintln!("ALL SETTING LENGTH: {:?}", all_settings(&working_copy.settings).len());

        all_settings(&working_copy.settings)
            .into_iter()
            .filter_map(|(k,s)| {
                eprintln!("{:?}", &k);
                if let Some(serde_json::Value::String(_expr)) = &s.value {
                    settings_to_eval += 1;

                    None
                } else {
                    s.value.clone()
                        .or(s.default_value.clone())
                        .map(|v| (k, v))
                }
            })
            .for_each(|(k, v)| {
                let v= match v {
                    serde_json::Value::String(s) => s.to_object(py),
                    serde_json::Value::Number(num) => num.as_f64().to_object(py),
                    serde_json::Value::Bool(b) => b.to_object(py),
                    serde_json::Value::Array(_) => {
                        // Skipping arrays
                        return
                    }
                    v => {
                        eprintln!(
                            "WARN: Skipping missing python conversion for {:?}: {:?}",
                            k,
                            v,
                        );
                        return
                    },
                };

                locals.set_item(k, v).expect("Set cura settings eval locals");
            });

        // Evalutate Value Expressions eg. "value": "layer_height * 4"
        let mut i = 0;
        while settings_to_eval > 0 {
            i += 1;
            if i > 10 {
                panic!("Too much settings eval recursion. Exiting to prevent infinite loop.");
            }

            eprintln!("\nLoop #{}. Settings remaining: {}\n\n", i, settings_to_eval);

            all_settings_mut(&mut working_copy.settings, &mut |k, setting| {
                if let Some(serde_json::Value::String(expr)) = setting.value.as_ref() {
                    // eprintln!("expr: {:?}", expr);

                    let value = py.eval(expr, None, Some(&locals));
                        // .expect(&format!("Executing expression for setting: {:?}", &k2));
                        // .extract()
                        // .expect(&format!("Parsing evaluated value for setting: {:?}", &k2));
                    if let Err(err) = value {
                        eprintln!("Error evaluating {:?}:\n  {}\n", &k, err);
                    } else {
                        let value = value.unwrap();
                        // dbg!(&value);
                        let extract_err = format!(
                            "Parsing setting {:?} value: {:?}",
                            &k,
                            &value
                        );

                        let json_val = match setting.value_type
                            .as_ref()
                            .expect("Cura Setting type")
                        {
                            CuraType::Bool => {
                                let val: bool = value.extract().expect(&extract_err);
                                serde_json::to_value(val).expect(&extract_err)
                            }
                            | CuraType::Float
                            | CuraType::Int
                            => {
                                let val: f32 = value.extract().expect(&extract_err);
                                serde_json::to_value(val).expect(&extract_err)
                            }
                            | CuraType::IntArray
                            | CuraType::Str
                            | CuraType::OptionalExtruder
                            | CuraType::Extruder
                            | CuraType::Enum
                            => {
                                let val: String = value.extract().expect(&extract_err);
                                serde_json::to_value(val).expect(&extract_err)
                            }
                            CuraType::Polygon => {
                                let val: Vec<Vec<f32>> = value.extract().expect(&extract_err);
                                serde_json::to_value(val).expect(&extract_err)
                            }
                            CuraType::Polygons => {
                                let val: Vec<Vec<Vec<f32>>> = value.extract().expect(&extract_err);
                                serde_json::to_value(val).expect(&extract_err)
                            }
                            CuraType::Category => {
                                panic!("Cura categories should not have values: {:?}", k);
                            }
                            // value_type => {
                            //     panic!("Cura type not yet supported for {:?}: {:?}", k, value_type);
                            // }
                        };

                        setting.default_value = Some(json_val);
                        setting.value = None;

                        settings_to_eval -= 1;

                        eprintln!("Setting evaluated: {:?} = {:?}", &k, &value);
                        locals.set_item(k, value).expect("Set cura settings locals");
                    }
                } else if setting.value.is_some() {
                    setting.default_value = std::mem::take(&mut setting.value);
                }

                setting
            });
        }
    });

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

        let def: CuraDef = serde_json::from_str(content)
            .expect(&format!("parse def file: {:?}", def_path));

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

fn merge_setting(a: &mut CuraSetting, b: &CuraSetting) {
    a.value = b.value.clone().or(std::mem::take(&mut a.value));
    a.default_value = b.default_value.clone().or(std::mem::take(&mut a.default_value));
    merge_json(&mut a.extra, &b.extra);
}
