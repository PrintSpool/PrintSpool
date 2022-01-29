## Cura Profile Merge

Cura `.def.json` files need some post-processing before they can be loaded into CuraEngine.

Cura Profile Merge does that post-processing and generates defs that are loadable by CuraEngine.

### Useage

1. Create a directory for the merged defs:
  ```bash
  mkdir ~/Downloads/merged-creality-3-defs
  ```
2. Clone the Ultimaker's Cura repo to get the printer defs
3. Merge the cura def of your choice:
  ```bash
  cargo run /Your/Cura/Git/Repo/resources/definitions/creality_ender3.def.json ~/Downloads/merged-creality-3-defs/
  ```
4. Run CuraEngine with the merged def:
```bash
CuraEngine slice \
  -j ~/Downloads/merged-creality-3-defs/merged.def.json \
  -s center_object=true \
  -o /Your/Output/GCode/Path/Here.gcode \
  -l /Your/STL/Here.stl \
```
