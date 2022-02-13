use std::{fs, path::{Path, PathBuf}, collections::{BTreeMap, HashMap, HashSet}};

use linked_hash_map::LinkedHashMap;
use pyo3::{types::IntoPyDict, PyObject};
use quality_config::InstConfig;
use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};

use lazy_static::lazy_static; // 1.4.0
use std::sync::Mutex;

type SettingsValueMap = Mutex<HashMap<String, PyObject>>;

lazy_static! {
    // Setting Key => Value
    static ref SETTING_VALUES: SettingsValueMap = Mutex::new(HashMap::new());

    // Extruder ID => Extruder Setting Key => Value
    static ref EXTRUDER_VALUES: Mutex<HashMap<String, SettingsValueMap>> = Mutex::new(
        HashMap::new()
    );
}

mod quality_config;
mod to_json;

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
    #[serde(default, skip_serializing_if = "HashMap::is_empty")]
    overrides: HashMap<String, CuraSetting>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct CuraSetting {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    value: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    default_value: Option<Value>,
    #[serde(default, rename="type", skip_serializing_if = "Option::is_none")]
    value_type: Option<CuraType>,

    /// Either a bool or an eval string is used to determine whether the setting should be enabled
    #[serde(skip_serializing_if = "Option::is_none")]
    enabled: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    resolve: Option<Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    minimum_value: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    minimum_value_warning: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    maximum_value: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    maximum_value_warning: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    warning_value: Option<Value>,

    #[serde(default, skip_serializing_if = "LinkedHashMap::is_empty")]
    options: LinkedHashMap<String, String>,
    #[serde(default, skip_serializing_if = "LinkedHashMap::is_empty")]
    children: LinkedHashMap<String, CuraSetting>,
    #[serde(flatten)]
    extra: Map<String, Value>,
}

#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
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
    if args.len() != 3 {
        panic!(
            "Expected useage: cura-profile-merge \\
                /path/to/settings.def.json \\
                /path/to/qualities/ \\
                /output/path.def.json \\
            "
        );
    }

    let input_path = PathBuf::from(args.next().unwrap());
    let qualities_dir = PathBuf::from(args.next().unwrap());
    let output_path = PathBuf::from(args.next().unwrap());
    std::fs::create_dir_all(&output_path).expect("Unable to create output directory");

    let resources_dir = input_path
        .ancestors()
        .skip(2)
        .next()
        .unwrap()
        .to_owned();

    // Load the quality configs
    eprintln!("\nLoading Quality Configs");
    eprintln!("==============================================================");

    let inst_config = quality_config::get_quality(qualities_dir, quality_config::QualityCriteria {
        quality_type: "low".to_string(),
        material: "generic_pla".to_string(),
        variant: "0.3mm Nozzle".to_string(),
    });

    // Create the merged printer def
    eprintln!("\nCreating Printer Def");
    eprintln!("==============================================================");

    create_merged_cura_def(
        &resources_dir,
        &input_path,
        &output_path.join("merged.def.json"),
        &SETTING_VALUES,
        &inst_config,
        // Once metadata is available create the extruder def so it can be used in resolving
        // extruder-dependent fields
        |metadata| {
            // Create merged defs for each extruder
            let extruders = metadata["machine_extruder_trains"].clone();
            let extruders: BTreeMap<String, String> = serde_json::from_value(extruders).unwrap();

            for (id, extruder) in extruders {
                eprintln!("\nCreating Extruder Def: {:?}", extruder);
                eprintln!("==============================================================");

                let extruder_filename = format!("{}.def.json", extruder);

                let extruder_values = Mutex::new(HashMap::new());

                create_merged_cura_def(
                    &resources_dir,
                    &resources_dir.join("extruders").join(&extruder_filename),
                    &output_path.join(extruder_filename),
                    &extruder_values,
                    &inst_config,
                    |_| {},
                );

                let mut extruder_values_guard = EXTRUDER_VALUES.lock()
                    .unwrap();

                extruder_values_guard.insert(id, extruder_values);

                eprintln!("\nCreating Extruder Def: {:?} [DONE]", extruder);
                eprintln!("==============================================================\n\n");
            }
        }
    );

    eprintln!("\nCreating Printer Def [DONE]");
    eprintln!("==============================================================");

    eprintln!("\nMerged Defs Written to: {:?}", &output_path);
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


/// See getDefaultValueInExtruder in Cura's CuraFormulaFunctions.py
#[pyo3::pyfunction]
#[pyo3(name = "extruderValue")]
fn extruder_value(extruder_position: u32, k: String) -> Option<PyObject> {
    eprintln!("Called extruderValue with: {:?}, {:?}", extruder_position, k);

    let extruder_values_guard = EXTRUDER_VALUES.lock()
        .unwrap();

    let extruder_values_guard_inner = extruder_values_guard
        .get(&extruder_position.to_string())
        .unwrap()
        .lock()
        .unwrap();

    extruder_values_guard_inner.get(&k)
        .map(|v| v.to_owned())
        .or_else(|| resolve_or_value(k))
}

/// See getDefaultValuesInAllExtruders in Cura's CuraFormulaFunctions.py
#[pyo3::pyfunction]
#[pyo3(name = "extruderValues")]
fn extruder_values(k: String) -> Vec<PyObject> {
    eprintln!("Called extruderValues with: {:?}", k);

    let mut extruder_values_guard = EXTRUDER_VALUES.lock()
        .unwrap();

    extruder_values_guard.iter_mut()
        .flat_map(|(_, mutex)| {
            let extruder_values_guard_inner = mutex
                .lock()
                .unwrap();

            extruder_values_guard_inner.get(&k)
                .map(|v| v.to_owned())
                .or_else(|| resolve_or_value(k.clone()))
        })
        .collect()
}

/// See getDefaultResolveOrValue in Cura's CuraFormulaFunctions.py
#[pyo3::pyfunction]
#[pyo3(name = "resolveOrValue")]
fn resolve_or_value(k: String) -> Option<PyObject> {
    eprintln!("Called resolveOrValue with: {:?}", k);

    let settings_values_guard = SETTING_VALUES
        .lock()
        .unwrap();

    settings_values_guard.get(&k).map(|v| v.to_owned())
}

/// See Cura's CuraFormulaFunctions.py
#[pyo3::pyfunction]
#[pyo3(name = "defaultExtruderPosition")]
fn default_extruder_position() -> String {
    eprintln!("Called defaultExtruderPosition");

    "0".into()
}

fn py_eval_as_json(
    py: pyo3::Python,
    expr: &str,
    locals: &pyo3::types::PyDict,
) -> pyo3::PyResult<serde_json::Value> {
    use pyo3::prelude::*;

    let value = py.eval(expr, None, Some(locals))?;

    let json_val = to_json::to_json(py, &value.to_object(py));

    Ok(json_val)
}

fn create_merged_cura_def<P1: AsRef<Path>, P2: AsRef<Path>, F>(
    resources_dir: P1,
    input_path: P2,
    output_path: P2,
    settings_values: &Mutex<HashMap<String, PyObject>>,
    inst_config: &InstConfig,
    mut metadata_cb: F,
) -> CuraDef
where
    F: FnMut(&Map<String, Value>),
{
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
    metadata_cb(&working_copy.metadata);

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

        cura_ctx.add_function(wrap_pyfunction!(extruder_value, cura_ctx).unwrap()).unwrap();
        cura_ctx.add_function(wrap_pyfunction!(extruder_values, cura_ctx).unwrap()).unwrap();
        cura_ctx.add_function(wrap_pyfunction!(resolve_or_value, cura_ctx).unwrap()).unwrap();
        cura_ctx.add_function(wrap_pyfunction!(default_extruder_position, cura_ctx).unwrap()).unwrap();

        for symbol in [
            "extruderValue",
            "extruderValues",
            "resolveOrValue",
            "defaultExtruderPosition",
        ] {
            locals.set_item(symbol, cura_ctx.getattr(symbol).unwrap())
                .unwrap();
        }

        let mut settings_to_eval = HashSet::new();

        eprintln!("SETTING LENGTH: {:?}", working_copy.settings.len());
        eprintln!("ALL SETTING LENGTH: {:?}", all_settings(&working_copy.settings).len());

        let mut settings_values_guard = settings_values.lock().unwrap();

        all_settings(&working_copy.settings)
            .into_iter()
            .filter_map(|(k,s)| {
                eprintln!("{:?}", &k);
                if let Some(serde_json::Value::String(expr)) = &s.value {
                    if !s.options.contains_key(expr) {
                        settings_to_eval.insert(k.to_string());

                        return None
                    }
                }
                if inst_config.values.contains_key(k) {
                    settings_to_eval.insert(k.to_string());

                    return None
                }

                s.value.clone()
                    .or(s.default_value.clone())
                    .map(|v| (k, v))
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

                locals.set_item(k, v.clone()).expect("Set cura settings eval locals");
                settings_values_guard.insert(k.to_string(), v);
            });

        drop(settings_values_guard);

        // Evalutate Value Expressions eg. "value": "layer_height * 4"
        let mut i = 0;
        let mut previous_settings_to_eval_len = usize::MAX;
        while settings_to_eval.len() > 0 {
            i += 1;
            if i > 10 {
                panic!("Too much settings eval recursion. Exiting to prevent infinite loop.");
            }

            if settings_to_eval.len() == previous_settings_to_eval_len {
                panic!(
                    "Unable to resolve settings. Defs may contain cyclic value logic. \
                    Unresolved settings: {:?}",
                    settings_to_eval.iter().collect::<Vec<_>>(),
                );
            }

            previous_settings_to_eval_len = settings_to_eval.len();

            eprintln!("\nLoop #{}. Settings remaining: {}\n\n", i, settings_to_eval.len());

            all_settings_mut(&mut working_copy.settings, &mut |k, setting| {
                let eval_replace_field = |field: &mut Option<serde_json::Value>| {
                    if let Some(serde_json::Value::String(expr)) = field.as_ref() {
                        let value = py.eval(expr, None, Some(&locals));
                        match value {
                            Err(err) => eprintln!(
                                "Error evaluating {:?} expression: {:?}\n  {}\n",
                                &k,
                                &expr,
                                err,
                            ),
                            Ok(val) => {
                                *field = Some(to_json::to_json(py, &val.to_object(py)));
                            },
                        }
                    }
                };

                eval_replace_field(&mut setting.enabled);
                eval_replace_field(&mut setting.resolve);
                eval_replace_field(&mut setting.minimum_value);
                eval_replace_field(&mut setting.minimum_value_warning);
                eval_replace_field(&mut setting.maximum_value);
                eval_replace_field(&mut setting.maximum_value_warning);
                eval_replace_field(&mut setting.warning_value);

                if settings_to_eval.contains(k) {
                    let json_val = if let Some(quality_val) = inst_config.values.get(k) {
                        if quality_val.starts_with("=") {
                            // InstConfig Value expression
                            let value = py_eval_as_json(
                                py,
                                &quality_val[1..],
                                &locals,
                            );

                            match value {
                                Err(err) => {
                                    eprintln!("Error evaluating inst config {:?}:\n  {}\n", &k, err);
                                    return setting;
                                }
                                Ok(value) => value
                            }
                        } else {
                            // InstConfig Value Literal
                            match setting.value_type.as_ref().unwrap() {
                                CuraType::Bool => {
                                    if
                                        quality_val == "1"
                                        || quality_val == "t"
                                    {
                                        serde_json::Value::Bool(true)
                                    } else if
                                        quality_val == "0"
                                        || quality_val == "f"
                                    {
                                        serde_json::Value::Bool(false)
                                    } else {
                                        panic!("Invalid inst config bool: {:?}", quality_val)
                                    }
                                }
                                CuraType::Float => {
                                    let f = quality_val.parse::<f32>()
                                        .expect("Invalid inst config float");

                                    serde_json::json!(f)
                                }
                                CuraType::Int => {
                                    let i = quality_val.parse::<i32>()
                                        .expect("Invalid inst config int");

                                    serde_json::json!(i)
                                }
                                _ => {
                                    serde_json::Value::String(quality_val.to_string())
                                }
                            }
                        }
                    } else if let Some(serde_json::Value::String(expr)) = setting.value.as_ref() {
                        // Def.JSON Value expression
                        let value = py_eval_as_json(
                            py,
                            expr,
                            &locals,
                        );

                        match value {
                            Err(err) => {
                                eprintln!("Error evaluating def.json {:?}:\n  {}\n", &k, err);
                                return setting;
                            }
                            Ok(value) => value
                        }
                    } else {
                        panic!("Value needing evaluation missing expression: {:?}", &k)
                    };

                    let py_object = match &json_val {
                        serde_json::Value::Bool(b) => b.to_object(py),
                        serde_json::Value::Number(n) => {
                            let n = n.as_f64().expect("Valid json number");

                            if n.fract() == 0.0 {
                                (n as i32).to_object(py)
                            } else {
                                n.to_object(py)
                            }
                        }
                        serde_json::Value::String(s) => s.to_object(py),
                        serde_json::Value::Null => Option::<i32>::None.to_object(py),
                        other => panic!(
                            "Conversion of json type to python not supported for {:?}",
                            other,
                        ),
                    };

                    setting.value = Some(json_val);

                    settings_to_eval.remove(k);

                    eprintln!("Setting evaluated: {:?} = {:?}", &k, &py_object);

                    locals.set_item(k, py_object.clone())
                        .expect("Set cura settings locals");

                    let mut settings_values_guard = settings_values
                        .lock()
                        .unwrap();

                    settings_values_guard.insert(k.to_string(), py_object);
                    drop(settings_values_guard);
                }

                setting
            });
        }
    });

    // Flatten the settings for CuraEngine
    working_copy.settings = all_settings(&working_copy.settings)
        .into_iter()
        .map(|(k, v)| (k.to_owned(), CuraSetting {
            default_value: v.value.clone().or(v.default_value.clone()),
            value: None,
            children: Default::default(),
            ..v.clone()
        }))
        .collect();

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
