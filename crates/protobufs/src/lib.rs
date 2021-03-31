#[macro_use]
extern crate bitflags;

#[path = "protos/teg_protobufs.rs"]
mod teg_protobufs;

pub use teg_protobufs::*;

mod machine_flags;
pub use machine_flags::MachineFlags;

pub use prost::Message;
