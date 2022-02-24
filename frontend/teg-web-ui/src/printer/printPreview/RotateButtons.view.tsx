import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import React from "react";

const RotateButtons = ({ renderer }) => (
  <>
    {['x', 'y', 'z'].map((axis) => (
      <TextField
        key={axis}
        label={`Rotation about ${axis.toUpperCase()}`}
        size="small"
        type="number"
        defaultValue={0}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            renderer.send({
              setModelRotation: { [axis]: val },
            });
          }
        }}
        inputProps={{
          step: 45
        }}
        sx={{
          display: 'block',
          width: {
            xs: '100%',
            md: 200,
          },
          mt: 2,
          '& .MuiInputBase-root': {
            width: '100%',
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              Degrees
            </InputAdornment>
          ),
        }}
      />
    ))}
  </>
)

export default RotateButtons
