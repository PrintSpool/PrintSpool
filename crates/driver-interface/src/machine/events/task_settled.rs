use crate::task::TaskStatus;

#[xactor::message(result = "()")]
#[derive(Clone, Debug)]
pub struct TaskSettled {
    pub task_id: crate::DbId,
    pub task_status: TaskStatus,
}
