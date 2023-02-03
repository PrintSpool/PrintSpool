mod foreign_key;
mod inline_compiler_error;
mod printspool_collection;

use printspool_collection::impl_printspool_collection;
use proc_macro::TokenStream;

/// A PrintSpool collection persisted to bonsaidb.
///
/// # Examples
///
/// ```
/// #[printspool_collection]
/// struct User {
///     #[printspool(foreign_key)]
///     instagram_id: u64
/// }
///
/// // A `load_by_id` function is added by default for the primary key:
/// User::load_by_id(Deletion::None, user_id).await?
///
/// // Each foreign key adds a `load_by_#name` function:
/// User::load_by_instagram_id(Deletion::None, user_id).await?
/// ```
///
/// the `#[printspool(foreign_key)]` attribute generates a load_by_#key(ctx) function.
/// Internally this defines a bonsaidb View and an async-graphql Loader.
///
/// By default an `id` primary key is added to the struct. To disable this you can set id = false:
///
/// ```
/// #[printspool_collection(id = false)]
/// struct MachineState {}
/// ```
///
/// `sort_key` can be used to append an additional compound key to the primary and foreign key views:
///
/// ```
/// #[printspool_collection(sort_key = |t: &Task| t.status.into::<TaskStatusKey>())]
/// struct Task {}
///
/// let tasks = Task::load_by_id(Deletion::None, task_id, TaskStatusKey::Spooled).await?
/// ```
/// ```

#[proc_macro_attribute]
pub fn printspool_collection(args: TokenStream, item: TokenStream) -> TokenStream {
    impl_printspool_collection(args, item)
}

#[proc_macro_derive(PrintSpoolCollection, attributes(printspool))]
pub fn derive_helper_attr(_item: TokenStream) -> TokenStream {
    TokenStream::new()
}
