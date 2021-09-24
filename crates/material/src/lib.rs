#[macro_use] extern crate nanoid;
#[macro_use] extern crate tracing;

mod material;
use std::sync::Arc;

pub use material::*;

pub mod resolvers;
pub use resolvers::material_mutation_resolvers::MaterialMutation;
pub use resolvers::material_query_resolvers::MaterialQuery;

mod configurable_material;

mod material_hooks;
pub use material_hooks::MaterialHooks;

pub type Db = sqlx::PgPool;
pub type DbId = teg_json_store::DbId;

pub type MaterialHooksList = Arc<Vec<Box<dyn MaterialHooks + Send + Sync>>>;
