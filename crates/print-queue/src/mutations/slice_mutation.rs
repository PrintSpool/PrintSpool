use std::os::unix::prelude::AsRawFd;

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
// use teg_json_store::Record as _;
// use teg_machine::{MachineHooksList, MachineMap};

#[derive(Default)]
pub struct SliceMutation;

#[derive(async_graphql::InputObject)]
struct SliceInput {
    // #[graphql(name="machineID")]
    // machine_id: ID,
    // // TODO: update graphql names to match latest struct fields
    // // #[field(name="partID")]
    // #[graphql(name="partID")]
    // part_id: ID,
    name: String,
    file: async_graphql::Upload,
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

            // TODO: Load the slicing profile path
            let slicing_profile_path = crate::paths::etc().join("CR30.cfg.ini");

            // Run the script
            let script = format!(
                "\
                    taskset --cpu-list 1-1024 belt-engine \
                        -o {} \
                        {} \
                        -c {} \
                        -s support_enable=True \
                ",
                &gcode_path.to_str().ok_or_else(|| eyre!("Non-utf8 file path"))?,
                &model_path,
                &slicing_profile_path.to_str().ok_or_else(|| eyre!("Non-utf8 file path"))?,
            );

            info!("Slicing...");
            info!("Running slicing command: {:?}", script);

            let _output = async_std::process::Command::new("sh")
                .arg("-c")
                .arg(script)
                .output()
                .await
                .wrap_err("Slicer error")?;

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
