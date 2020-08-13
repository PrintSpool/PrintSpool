use std::sync::Arc;
use sled::{
    IVec,
    Tree,
};
use sled::transaction::{
    TransactionalTree,
    ConflictableTransactionError,
    ConflictableTransactionResult,
};

pub(crate) trait IntoTransactionResult<T, E> {
    fn into_transaction_result(self) -> ConflictableTransactionResult<T, E>;
}

impl<T, E> IntoTransactionResult<T, E> for sled::Result<T> {
    fn into_transaction_result(self) -> ConflictableTransactionResult<T, E> {
        self.map_err(|err| ConflictableTransactionError::Storage(err))
    }
}

pub trait ScopedTree:
    Sized
{
    fn get<K: AsRef<[u8]>, E>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>, E>;

    fn insert<K, V>(
        &self,
        key: K,
        value: V,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K> + From<V>,
        K: AsRef<[u8]>;

}

impl ScopedTree for &TransactionalTree {
    fn get<K: AsRef<[u8]>, E>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>, E> {
        TransactionalTree::get(&self, key)
    }

    fn insert<K, V>(
        &self,
        key: K,
        value: V,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K> + From<V>,
        K: AsRef<[u8]>,
    {
        TransactionalTree::insert(&self, key, value)
    }
}

impl ScopedTree for sled::Db {
    fn get<K: AsRef<[u8]>, E>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>, E> {
        Tree::get(&self, key).into_transaction_result()
    }

    fn insert<K, V>(
        &self,
        key: K,
        value: V,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K> + From<V>,
        K: AsRef<[u8]>,
    {
        Tree::insert(&self, key, value).into_transaction_result()
    }
}

impl ScopedTree for Arc<sled::Db> {
    fn get<K: AsRef<[u8]>, E>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>, E> {
        Tree::get(&self, key).into_transaction_result()
    }

    fn insert<K, V>(
        &self,
        key: K,
        value: V,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K> + From<V>,
        K: AsRef<[u8]>,
    {
        Tree::insert(&self, key, value).into_transaction_result()
    }
}

impl ScopedTree for &sled::Db {
    fn get<K: AsRef<[u8]>, E>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>, E> {
        Tree::get(&self, key).into_transaction_result()
    }

    fn insert<K, V>(
        &self,
        key: K,
        value: V,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K> + From<V>,
        K: AsRef<[u8]>,
    {
        Tree::insert(&self, key, value).into_transaction_result()
    }
}
