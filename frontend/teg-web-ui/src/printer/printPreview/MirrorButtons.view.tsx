import React from 'react'
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from '@mui/material/Switch';

const MirrorButtons = ({
  renderer,
}) => (
  <>
    {['x', 'y', 'z'].map((axis) => (
      <FormControlLabel
        key={axis}
        control={<Switch/>}
        label={`Flip ${axis.toUpperCase()}`}
        onChange={(_e, checked) => {
          renderer.send({ setModelMirroring: { [axis]: checked}})
        }}
        sx={{
          display: 'block',
          mt: 1,
        }}
      />
    ))}
  </>
)

export default MirrorButtons
