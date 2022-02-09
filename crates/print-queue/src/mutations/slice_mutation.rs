use std::{os::unix::prelude::AsRawFd, path::PathBuf};

use async_std::fs;
use eyre::{
    Result,
    eyre,
    Context as _,
};
use async_graphql::{
    // ID,
    FieldResult,
};
// use printspool_json_store::Record as _;
// use printspool_machine::{MachineHooksList, MachineMap};

#[derive(Default)]
pub struct SliceMutation;

#[derive(async_graphql::InputObject)]
struct Vec3Input {
    x: f64,
    y: f64,
    z: f64,
}

#[derive(async_graphql::InputObject)]
struct SliceInput {
    // #[graphql(name="machineID")]
    // machine_id: ID,
    // // TODO: update graphql names to match latest struct fields
    // // #[field(name="partID")]
    // #[graphql(name="partID")]
    // part_id: ID,
    name: String,
    rotation_mat3: Vec<Vec3Input>,
    position: Vec3Input,
    scale: Vec3Input,
    file: async_graphql::Upload,
    #[graphql(name = "slicerEngineID")]
    slicer_engine_id: String,
}

#[async_graphql::Object]
impl SliceMutation {
    /// Slices a 3D model on the print server and returns GCode
    #[instrument(skip(self, input, ctx))]
    async fn slice<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: SliceInput,
    ) -> FieldResult<String> {
        // let db: &crate::Db = ctx.data()?;

        // let machines: &MachineMap = ctx.data()?;
        // let machines = machines.load();
        // let machine_hooks: &MachineHooksList = ctx.data()?;

        async move {
            if input.rotation_mat3.len() != 3 {
                return Err(eyre!("rotationMat3 must contain 3 elements"));
            }

            // let machine = machines.get(&input.machine_id)
            //     .ok_or_else(||
            //         eyre!("machine ({:?}) not found for spool job file", input.machine_id)
            //     )?;

            // Rename the model file to add the appropriate file extension (eg. ".stl")
            let tmp_model = input.file.value(&ctx)?.content;
            let tmp_model_path = format!("/proc/self/fd/{}", tmp_model.as_raw_fd());

            let file_ext = std::path::Path::new(&input.name)
                .extension()
                .and_then(std::ffi::OsStr::to_str)
                .ok_or_else(|| eyre!("Invalid or missing file extension"))?;

            let tmp_path = crate::paths::var().join("tmp");

            let model_dir = tempfile::tempdir_in(tmp_path)?;
            let model_tmp_name = format!("model.{}", file_ext);

            let model_path = model_dir.path().join(model_tmp_name)
                .to_str()
                .map(|s| s.to_string())
                .ok_or_else(|| eyre!("Non-utf8 file path"))?;

            nix::unistd::linkat(
                None,
                &tmp_model_path[..],
                None,
                &model_path[..],
                nix::unistd::LinkatFlags::SymlinkFollow,
            )?;

            // Create a temporary directory for the gcode output
            let gcode_dir = tempfile::TempDir::new()?;
            let gcode_path = gcode_dir.path().join("output.gcode");

            // Run the script
            info!("Slicing...");

            let slicer_engine = match &input.slicer_engine_id[..] {
                "curaEngine" => std::env::var("CURA_ENGINE")?,
                "beltEngine" => std::env::var("BELT_ENGINE")?,
                engine => {
                    return Err(eyre!("Slicer engine not supported: {:?}", engine))
                }
            };

            // TODO: Load the slicing profile path
            let slicer_profile_path = match &input.slicer_engine_id[..] {
                "curaEngine" => PathBuf::from(std::env::var("SLICING_PROFILE")?),
                "beltEngine" => crate::paths::etc().join("CR30.cfg.ini"),
                engine => {
                    return Err(eyre!("Slicer engine not supported: {:?}", engine))
                }
            };

            let is_belt_slicer = input.slicer_engine_id == "beltEngine";

            // // I think this is redundant since we are already in a process with CPU affinity
            // let mut cmd = async_std::process::Command::new("taskset");

            // cmd
            //     .arg("--cpu-list")
            //     .arg("1-1024")
            //     .arg(&slicer_engine);

            let mut cmd = async_std::process::Command::new(&slicer_engine);

            if is_belt_slicer {
                cmd
                    // slicing profile
                    .arg("-c")
                    .arg(slicer_profile_path);
            } else {
                cmd
                    .env(
                        "LD_LIBRARY_PATH",
                        crate::paths::etc().join("cura-engine/lib/"),
                    )
                    // CuraEngine needs the slice sub-command.
                    // ie. `CuraEngine slice ...` vs `belt-slicer ...`
                    .arg("slice")
                    .arg("-p")
                    // slicing profile
                    .arg("-j")
                    .arg(slicer_profile_path);
            }

            cmd
                // rotation & scale
                .arg("-s")
                .arg(format!(
                    "mesh_rotation_matrix=[[{},{},{}],[{},{},{}],[{},{},{}]]",
                    input.rotation_mat3[0].x,
                    input.rotation_mat3[0].y,
                    input.rotation_mat3[0].z,
                    input.rotation_mat3[1].x,
                    input.rotation_mat3[1].y,
                    input.rotation_mat3[1].z,
                    input.rotation_mat3[2].x,
                    input.rotation_mat3[2].y,
                    input.rotation_mat3[2].z,
                ))
                // position
                .arg("-s")
                .arg(format!("mesh_position_x={}", input.position.x))
                .arg("-s")
                .arg(format!("mesh_position_y={}", input.position.y))
                .arg("-s")
                .arg(format!("mesh_position_z={}", input.position.z))
                // gcode output
                .arg("-o")
                .arg(gcode_path.clone());

            if is_belt_slicer {
                // load model
                cmd.arg(model_path);
            } else {
                // CuraEngine -l loads the model
                // ie. `CuraEngine slice -l <model_file>...` vs `belt-slicer <model_file>...`
                cmd
                    // load model
                    .arg("-l")
                    .arg(model_path);
            }

            info!("Slicer command: {:?}", cmd);

            let output = cmd
                .output()
                .await
                .wrap_err("Slicer error")?;

            let mut stderr = String::from_utf8_lossy(&output.stderr).to_string();

            if output.status.success() {
                info!("{}", stderr);
            } else {
                if slicer_engine == "curaEngine" {
                    stderr = stderr
                        .lines()
                        .filter(|line| line.starts_with("[ERROR]"))
                        .collect::<Vec<_>>()
                        .join("\n");
                }

                return Err(eyre!(stderr));
            }

            let gcode = fs::read_to_string(&gcode_path).await?;

            info!("Slicing... [DONE]");

            Result::<_>::Ok(gcode)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
