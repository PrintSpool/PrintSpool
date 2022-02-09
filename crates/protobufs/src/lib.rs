#[macro_use]
extern crate bitflags;

#[path = "protos/printspool_protobufs.rs"]
mod printspool_protobufs;

pub use printspool_protobufs::*;

mod machine_flags;
pub use machine_flags::MachineFlags;

pub use prost::Message;
