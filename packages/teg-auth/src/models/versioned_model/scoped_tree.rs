use std::sync::Arc;
use sled::{
    IVec,
    Tree,
};
use sled::transaction::{
    TransactionResult,
    TransactionError,
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

impl<T, E> IntoTransactionResult<T, E> for TransactionResult<T, E> {
    fn into_transaction_result(self) -> ConflictableTransactionResult<T, E> {
        match self {
            Err(TransactionError::Abort(e)) => Err(ConflictableTransactionError::Abort(e)),
            Err(TransactionError::Storage(e)) => Err(ConflictableTransactionError::Storage(e)),
            Ok(t) => Ok(t),
        }
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

    fn remove<K>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K>,
        K: AsRef<[u8]>;

    fn transaction<F, A, E>(
        &self,
        f: F,
    ) -> ConflictableTransactionResult<A, E>
    where
        F: Fn(
            &TransactionalTree,
        ) -> ConflictableTransactionResult<A, E>;
}

impl ScopedTree for &TransactionalTree {
    fn get<K: AsRef<[u8]>, E>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>, E> {
        info!("BEFORE GET");
        let res = TransactionalTree::get(&self, key);
        info!("AFTER GET1");
        res
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

    fn remove<K>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K>,
        K: AsRef<[u8]>
    {
        TransactionalTree::remove(&self, key)
    }

    fn transaction<F, A, E>(
        &self,
        f: F,
    ) -> ConflictableTransactionResult<A, E>
    where
        F: Fn(
            &TransactionalTree,
        ) -> ConflictableTransactionResult<A, E>
    {
        f(&self)
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

    fn remove<K>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K>,
        K: AsRef<[u8]>
    {
        Tree::remove(&self, key).into_transaction_result()
    }

    fn transaction<F, A, E>(
        &self,
        f: F,
    ) -> ConflictableTransactionResult<A, E>
    where
        F: Fn(
            &TransactionalTree,
        ) -> ConflictableTransactionResult<A, E>
    {
        Tree::transaction(&self, f).into_transaction_result()
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

    fn remove<K>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K>,
        K: AsRef<[u8]>
    {
        Tree::remove(&self, key).into_transaction_result()
    }

    fn transaction<F, A, E>(
        &self,
        f: F,
    ) -> ConflictableTransactionResult<A, E>
    where
        F: Fn(
            &TransactionalTree,
        ) -> ConflictableTransactionResult<A, E>
    {
        Tree::transaction(&self, f).into_transaction_result()
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

    fn remove<K>(
        &self,
        key: K,
    ) -> ConflictableTransactionResult<Option<IVec>>
    where
        IVec: From<K>,
        K: AsRef<[u8]>
    {
        Tree::remove(&self, key).into_transaction_result()
    }

    fn transaction<F, A, E>(
        &self,
        f: F,
    ) -> ConflictableTransactionResult<A, E>
    where
        F: Fn(
            &TransactionalTree,
        ) -> ConflictableTransactionResult<A, E>
    {
        Tree::transaction(&self, f).into_transaction_result()
    }
}
