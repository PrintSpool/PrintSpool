pub mod add_parts_to_print_queue_mutation;
use add_parts_to_print_queue_mutation::AddPartsToPrintQueueMutation;

pub mod delete_packages_mutation;
use delete_packages_mutation::DeletePackagesMutation;

pub mod delete_parts_mutation;
use delete_parts_mutation::DeletePartsMutation;

pub mod exec_gcodes_mutation;
use exec_gcodes_mutation::ExecGCodesMutation;

pub mod pause_print_mutation;
use pause_print_mutation::PausePrintMutation;

pub mod resume_print_mutation;
use resume_print_mutation::ResumePrintMutation;

pub mod set_part_positions_mutation;
use set_part_positions_mutation::SetPartPositionsMutation;

pub mod set_part_quantity_mutation;
use set_part_quantity_mutation::SetPartQuantityMutation;

pub mod print_mutation;
use print_mutation::PrintMutation;

pub mod star_mutations;
use star_mutations::StarMutations;

#[derive(async_graphql::MergedObject, Default)]
pub struct PrintQueueMutation(
    AddPartsToPrintQueueMutation,
    DeletePackagesMutation,
    DeletePartsMutation,
    ExecGCodesMutation,
    PausePrintMutation,
    ResumePrintMutation,
    SetPartPositionsMutation,
    SetPartQuantityMutation,
    PrintMutation,
    StarMutations,
);
