path = require ("flavored-path")
SlicerFactory = require("../lib/slicer_factory")

SlicerFactory.slice
  engine: "cura"
  file_path: path.resolve("#{__dirname}/assets/Sphere20Face.amf")
  onComplete: (slicer) -> console.log slicer.gcode_path
