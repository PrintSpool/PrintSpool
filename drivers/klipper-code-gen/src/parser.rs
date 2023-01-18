use std::collections::HashMap;

use markdown::{Block, Span};

#[derive(Clone, PartialEq)]
enum LookingFor {
    Section,
    CodeBlock(String),
}

#[derive(Debug, Default)]
pub struct Section {
    pub has_id: bool,
    pub variables: Vec<Variable>,
    pub include_klipper_pin: bool,
}

#[derive(Debug)]
pub struct Variable {
    pub name: String,
    pub docs: Vec<String>,
    pub optional: bool,
    pub rust_type: String,
}

pub fn parse_config_reference() -> HashMap<String, Section> {
    let config_reference_markdown = markdown::tokenize(include_str!("../Config_Reference.md"));

    // Code block section names to rename (eg. `[stepper_x]` should be `[stepper]` to match it's header `### [stepper]`)
    let mut rename_map = HashMap::new();
    rename_map.insert("stepper_x".to_string(), "stepper".to_string());

    // Sections to fully ignore because they would generate incorrect or unecessary code
    let ignore_list = vec![
        "stepper_z1".to_string(),
        "extruder1".to_string(),
        "include".to_string(),
        "manual_stepper".to_string(),
    ];

    let mut looking_for = LookingFor::Section;
    let mut sections = HashMap::<String, Section>::new();

    for block in config_reference_markdown {
        match (&looking_for, &block) {
            (_, Block::Header(header, 3)) => {
                // Find headers of the format `### [header_title]`
                looking_for = LookingFor::Section;

                let Some(Span::Text(text)) = header.first() else {
                    continue
                };
                if !(text.starts_with('[') && text.ends_with(']')) {
                    continue;
                }

                // println!("\nParsing {} section", text);
                let section_name = text.replace("[", "").replace("]", "").clone();

                if ignore_list.contains(&section_name) {
                    continue;
                }

                sections.insert(section_name, Default::default());
                looking_for = LookingFor::CodeBlock(text.clone());
            }
            (LookingFor::CodeBlock(header_text), Block::CodeBlock(_, config_example)) => {
                let mut lines = config_example.lines();

                let Some(first_line) = lines.next() else {
                    continue
                };

                let section_name = if first_line.starts_with('[') && first_line.ends_with(']') {
                    first_line.replace("[", "").replace("]", "").to_string()
                } else {
                    println!(
                        "Skip: Code block that does not start with a section header in {:?}",
                        header_text
                    );
                    continue;
                };

                let (section_name, example_id) = section_name
                    .split_once(" ")
                    .unwrap_or_else(|| (&section_name, ""));

                let mut section_name = section_name.to_string();
                section_name = rename_map
                    .get(&section_name)
                    .map(|n| n.clone())
                    .unwrap_or(section_name);

                if header_text != &format!("[{}]", section_name) {
                    println!(
                        "Skip: Section header {:?} does not match code block {:?}",
                        header_text, first_line,
                    );
                    continue;
                }

                let mut variables: Vec<Variable> = vec![];

                let Some(section) = sections.get_mut(&section_name) else {
                    panic!("Section missing from hasmap: {:?}", section_name)
                };

                for line in config_example.lines() {
                    if line.starts_with("# ") {
                        // Documentation Comment
                        if let Some(v) = variables.last_mut() {
                            v.docs.push(line.replacen("# ", "", 1).trim().to_string())
                        }
                    } else if line.contains(":") {
                        let name = line.split(":").next().unwrap().replace("#", "");

                        if name.contains("<") {
                            println!("Skip: {:?}, invalid variable name", name);
                            continue;
                        }
                        let rust_type = if name.ends_with("_pin") || name == "pin" {
                            section.include_klipper_pin = true;
                            "KlipperPin"
                        } else {
                            "f64"
                        }
                        .to_string();

                        // Variable Definition
                        variables.push(Variable {
                            name,
                            docs: Default::default(),
                            rust_type,
                            optional: line.starts_with("#"),
                        });
                    }
                }

                section.has_id = example_id.len() > 0;

                section.variables.append(&mut variables);

                // println!("Parsed code block");
            }
            (LookingFor::CodeBlock(_), Block::Header(_, _)) => {
                // (LookingFor::CodeBlock(_), Block::Header(_, level)) if *level <= 3 => {
                // println!("Exiting section");
                looking_for = LookingFor::Section;
            }
            _ => {}
        }
    }

    sections
}
