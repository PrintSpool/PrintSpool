use super::{Task, TaskPackageFk, TaskPartFk, TaskPrintQueueFk, TaskStatusKey};
use crate::{machine::Machine, DbId, Deletion};
use bonsaidb::core::{
    define_basic_mapped_view, define_basic_unique_mapped_view, document::CollectionDocument,
    schema::view::map::Mappings,
};
use chrono::prelude::*;

define_basic_unique_mapped_view!(
    TasksById,
    Task,
    0,
    "by:id",
    (Deletion, DbId<Task>, TaskStatusKey),
    |document: CollectionDocument<Task>| {
        let c = document.contents;
        document
            .header
            .emit_key((c.deleted_at.into(), c.id, c.status.into()))
    }
);

define_basic_mapped_view!(
    TasksByMachine,
    Task,
    0,
    "by-machine",
    (Deletion, DbId<Machine>, TaskStatusKey),
    |document: CollectionDocument<Task>| {
        let c = document.contents;
        document
            .header
            .emit_key((c.deleted_at.into(), c.machine_id, c.status.into()))
    }
);

define_basic_mapped_view!(
    TasksByPart,
    Task,
    0,
    "by-part",
    (Deletion, DbId<TaskPartFk>, TaskStatusKey),
    |document: CollectionDocument<Task>| {
        let c = document.contents;
        if let Some(part_id) = c.part_id {
            document
                .header
                .emit_key((c.deleted_at.into(), part_id, c.status.into()))
        } else {
            Ok(Mappings::none())
        }
    }
);

define_basic_mapped_view!(
    TasksByPackage,
    Task,
    0,
    "by-package",
    (Deletion, DbId<TaskPackageFk>, TaskStatusKey),
    |document: CollectionDocument<Task>| {
        let c = document.contents;
        if let Some(package_id) = c.package_id {
            document
                .header
                .emit_key((c.deleted_at.into(), package_id, c.status.into()))
        } else {
            Ok(Mappings::none())
        }
    }
);

define_basic_mapped_view!(
    TasksByPrintQueue,
    Task,
    0,
    "by:print_queue|created_at",
    (
        Deletion,
        DbId<TaskPrintQueueFk>,
        DateTime<Utc>,
        TaskStatusKey
    ),
    |document: CollectionDocument<Task>| {
        let c = document.contents;

        if let Some(print_queue_id) = document.contents.print_queue_id {
            document.header.emit_key((
                c.deleted_at.into(),
                print_queue_id,
                document.contents.created_at,
                c.status.into(),
            ))
        } else {
            Ok(Mappings::none())
        }
    }
);
