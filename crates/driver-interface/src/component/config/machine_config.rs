// use std::path::PathBuf;

// use super::Feedrate;

// impl MachineConfig {
//     // Set to the name of the snap to connect an external printspool-marlin process to the snap's
//     // tmp directory and socket. Generally this is only useful for printspool-marlin development.
//     pub fn debug_snap_name() -> Option<String> {
//         std::env::var("DEBUG_TEG_SNAP").ok()
//     }

//     pub fn core_plugin<'a>(&'a self) -> Result<&'a PluginContainer<CorePluginConfig>> {
//         let core_plugin = self
//             .plugins
//             .iter()
//             .find_map(|plugin| {
//                 match plugin {
//                     Plugin::Core(core_plugin) => Some(core_plugin), // _ => None,
//                 }
//             })
//             .ok_or_else(|| eyre!("Could not find teg-core plugin config"))?;

//         Ok(core_plugin)
//     }

//     pub fn core_plugin_mut<'a>(&'a mut self) -> Result<&'a mut PluginContainer<CorePluginConfig>> {
//         let core_plugin = self
//             .plugins
//             .iter_mut()
//             .find_map(|plugin| {
//                 match plugin {
//                     Plugin::Core(core_plugin) => Some(core_plugin), // _ => None,
//                 }
//             })
//             .ok_or_else(|| eyre!("Could not find teg-core plugin config"))?;

//         Ok(core_plugin)
//     }

//     pub fn name(&self) -> Result<String> {
//         let name = self.core_plugin()?.model.name.clone();

//         Ok(name)
//     }

//     pub fn tty_path(&self) -> &String {
//         lazy_static! {
//             pub static ref TTY_OVERRIDE: Option<String> = std::env::var("TEG_TTY_OVERRIDE").ok();
//         }

//         if let Some(tty_override) = TTY_OVERRIDE.as_ref() {
//             tty_override
//         } else {
//             &self.get_controller().model.serial_port_id
//         }
//     }

//     pub fn feedrates(&self) -> Vec<Feedrate> {
//         let axe_feedrates = self.axes.iter().map(|Axis { model: axis, .. }| Feedrate {
//             address: axis.address.clone(),
//             feedrate: axis.feedrate,
//             reverse_direction: axis.reverse_direction,
//             is_toolhead: false,
//         });

//         let toolhead_feedrates = self.toolheads.iter().map(
//             |Toolhead {
//                  model: toolhead, ..
//              }| {
//                 Feedrate {
//                     address: toolhead.address.clone(),
//                     feedrate: toolhead.feedrate,
//                     reverse_direction: false,
//                     is_toolhead: true,
//                 }
//             },
//         );

//         axe_feedrates.chain(toolhead_feedrates).collect()
//     }

//     pub fn var_path(&self) -> PathBuf {
//         // let path = if let Some(snap_name) = &Self::debug_snap_name() {
//         //     format!("/var/snap/{}/current/var", snap_name)
//         // } else {
//         //     format!("/var/lib/teg{}", dev_suffix())
//         // };

//         crate::paths::var()
//     }

//     /// Data in var-common is shared across Snap refresh versions. This is useful for machine
//     /// sockets when a new server needs to connect to a previous version of the driver.
//     pub fn var_common_path(&self) -> PathBuf {
//         // let path = if let Some(snap_name) = &Self::debug_snap_name() {
//         //     format!("/var/snap/{}/common/var", snap_name)
//         // } else {
//         //     format!("/var/lib/teg{}-common", dev_suffix())
//         // };

//         crate::paths::var()
//     }

//     pub fn socket_path(&self) -> PathBuf {
//         let file_name = format!("machine-{}.sock", self.id.to_string());

//         self.var_common_path().join(file_name)
//     }

//     pub fn backups_dir(&self) -> PathBuf {
//         self.var_path().join("backups")
//     }

//     pub fn transform_gcode_file_path(&self, file_path: String) -> String {
//         // use std::path::Path;

//         // if let Some(snap_name) = &Self::debug_snap_name() {
//         //     format!(
//         //         "/var/snap/{}/current/var/tasks/{}",
//         //         snap_name,
//         //         Path::new(&file_path).file_name().unwrap().to_str().unwrap(),
//         //     )
//         // } else {
//         // }
//         file_path
//     }

//     pub fn config_file_path(id: &crate::DbId) -> PathBuf {
//         // if let Some(snap_name) = &Self::debug_snap_name() {
//         //     format!("/var/snap/{}/current/etc/machine-{}.toml", snap_name, id)
//         // } else {
//         // }
//         crate::paths::etc_common().join(format!("machine-{}.toml", id))
//     }

//     pub fn pid_file_path(id: &crate::DbId) -> PathBuf {
//         crate::paths::pid_file(&format!("machine-{}", id)[..])
//     }
// }
