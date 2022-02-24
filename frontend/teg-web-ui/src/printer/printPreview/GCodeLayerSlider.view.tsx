import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import React from "react";

const GCodeLayerSlider = ({
  topLayer,
  renderer,
  printFile,
  sx = {},
}) => (
  <Box sx={{
    zIndex: 10,
    height: '100%',
    pt: 1,
    pb: 3,
    gridArea: 'layer',
    ...sx,
  }}>
    <Slider
      key={topLayer}
      orientation="vertical"
      defaultValue={topLayer}
      max={topLayer}
      disabled={printFile?.gcodeVersion == null}
      onChange={(e, val: number) => {
        renderer.send({ setLayer: val });
      }}
    />
  </Box>
)

export default GCodeLayerSlider
