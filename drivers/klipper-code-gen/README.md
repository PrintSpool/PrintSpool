## Klipper Code Gen

This crate generates klipper driver structs from Klipper's Config_Reference documentation. The parser and generator are very basic
and there aren't enough machine readable type indications in Klipper's docs to automatically do everything. This should only be used to initially generate new config files and then those files should be edited to match the Klipper documentation by hand.

Since the files, once generated are intended to by maintained and improved by humans, this will not overwrite existing components in `klipper/src/generated/*.rs`, however it will always overwrite `klipper/src/generated.rs`. 

Generated files are prefixed with an underscore (`_`) so that they are easier to find for editing after generation.