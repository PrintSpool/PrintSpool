import React from 'react'
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const MoveButtons = ({
  renderer,
}) => (
  <>
    {['x', 'y', 'z'].map((axis) => (
      <TextField
        key={axis}
        label={axis.toUpperCase()}
        size="small"
        type="number"
        defaultValue={0}
        inputProps={{
          step: 10
        }}
        sx={{
          display: 'block',
          width: 150,
          mt: 2,
        }}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            renderer.send({
              setModelPosition: { [axis]: val },
            });
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              mm
            </InputAdornment>
          ),
        }}
      />
    ))}
  </>
)

export default MoveButtons
