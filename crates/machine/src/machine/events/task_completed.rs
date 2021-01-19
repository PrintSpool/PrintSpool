#[xactor::message(result = "()")]
pub struct TaskCompleted {
    pub task_id: crate::DbId,
}
