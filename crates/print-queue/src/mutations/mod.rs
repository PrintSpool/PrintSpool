pub mod create_job_mutation;
use create_job_mutation::CreateJobMutation;

pub mod delete_job_mutation;
use delete_job_mutation::DeleteJobMutation;

pub mod exec_gcodes_mutation;
use exec_gcodes_mutation::ExecGCodesMutation;

pub mod pause_print_mutation;
use pause_print_mutation::PausePrintMutation;

pub mod resume_print_mutation;
use resume_print_mutation::ResumePrintMutation;

pub mod set_part_position_mutation;
use set_part_position_mutation::SetPartPositionMutation;

pub mod print_mutation;
use print_mutation::PrintMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct PrintQueueMutation(
    CreateJobMutation,
    DeleteJobMutation,
    ExecGCodesMutation,
    PausePrintMutation,
    ResumePrintMutation,
    SetPartPositionMutation,
    PrintMutation,
);
