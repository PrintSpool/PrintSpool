use std::{path::Path, fs};

use linked_hash_map::LinkedHashMap;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct InstConfig {
    pub general: General,
    pub metadata: Metadata,
    pub values: LinkedHashMap<String, String>,
}

#[derive(Deserialize, Debug)]
pub struct General {
    pub version: u32,
    pub name: String,
    pub definition: String,
    #[serde(flatten)]
    pub extra: LinkedHashMap<String, String>,
}

#[derive(Deserialize, Debug)]
pub struct Metadata {
    pub setting_version: u32,
    #[serde(rename = "type")]
    pub config_type: ConfigType,
    #[serde(default)]
    pub weight: i32,
    #[serde(default)]
    pub global_quality: bool,
    #[serde(default)]

    pub quality_type: String,
    pub material: Option<String>,
    #[serde(default)]
    pub variant: Option<String>,

    #[serde(flatten)]
    pub extra: LinkedHashMap<String, String>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum ConfigType {
    Quality,
    Variant,
}

pub struct QualityCriteria {
    pub quality_type: String,
    pub material: String,
    pub variant: String,
}

pub fn get_quality<P: AsRef<Path>>(qualities_dir: P, criteria: QualityCriteria) -> InstConfig {
    let mut qualities = load_qualities(qualities_dir.as_ref(), &criteria);
    qualities.sort_by_key(|q| q.metadata.weight);

    // Merge the inerited InstConfigs into the top level one
    let mut quality = qualities.pop().unwrap();

    for (k, v) in qualities.into_iter().flat_map(|q| q.values.into_iter()) {
        quality.values.insert(k, v);
    }

    dbg!(&quality);

    quality
}

fn load_qualities(dir: &Path, criteria: &QualityCriteria) -> Vec<InstConfig> {
    let mut qualities = Vec::new();

    if dir.is_dir() {
        for entry in fs::read_dir(dir).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir() {
                qualities.append(&mut load_qualities(&path, criteria));
            } else {
                eprintln!("Quality: {:?}", path);

                let quality_str = fs::read_to_string(&path)
                    .expect(&format!("load quality file: {:?}", &path));

                let quality: InstConfig = config::Config::builder()
                    .add_source(
                        config::File::from_str(&quality_str, config::FileFormat::Ini)
                    )
                    .build()
                    .expect(&format!("parse quality file {:?}:\n{}\n", &path, &quality_str))
                    .try_deserialize()
                    .expect(&format!("deserialize quality file {:?}:\n{}\n", &path, &quality_str));
                // let quality: Quality = toml::from_str(&quality_str)
                //     .expect(&format!("parse quality file {:?}:\n{}\n", &path, &quality_str));

                // Filter to only quality files that are applicable to the criteria
                if
                    quality.metadata.quality_type == criteria.quality_type
                    && (quality.metadata.global_quality || (
                        quality.metadata.material.as_ref() == Some(&criteria.material)
                        && quality.metadata.variant.as_ref() == Some(&criteria.variant)
                    ))
                {
                    qualities.push(quality)
                }
            }
        }
    }

    qualities
}
