#[derive(async_graphql::SimpleObject, Debug, Clone, SmartDefault)]
pub struct MachineError {
    /// A machine-readable code indicating the type of error
    pub code: String,
    /// A human-readable description of the error
    pub message: String,
}
