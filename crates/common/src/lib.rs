pub struct Void;

#[async_graphql::Object]
impl Void {
    pub async fn id(&self) -> async_graphql::ID {
        "VOID".into()
    }
}
