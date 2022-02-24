import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';

const ScaleButtons = ({
  renderer,
}) => {
  const [scaleAxesTogether, setScaleAxesTogether] = useState(true)

  const {
    register,
    errors,
    watch,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      scale: { x: 100, y: 100, z: 100, },
    },
  })

  const scale = watch('scale');

  const scaleAllBy = (scaleVal) => {
    reset({
      scale: Object.fromEntries(
        Object.entries(scale).map(([k, v]) => (
          [k, scaleVal]
        ))
      ),
    });
    renderer.send({
      setModelScale: { x: scaleVal / 100, y: scaleVal / 100, z: scaleVal / 100 }
    });
  };

  return (
    <>
      {['x', 'y', 'z'].map((axis) => (
        <Box key={axis} sx={{ mt: 2 }}>
          <TextField
            name={`scale[${axis}]`}
            label={`${axis.toUpperCase()} Scale`}
            size="small"
            type="number"
            fullWidth
            inputRef={register({
              required: 'Required',
              validate: {
                number: v => !isNaN(parseFloat(v)) || 'Must be a number',
                positive: v => parseFloat(v) > 0 || 'should be greater than 0',
              },
              valueAsNumber: true,
            })}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (isNaN(val) || val === scale[axis] || val <= 0) {
                return
              }

              if (scaleAxesTogether) {
                scaleAllBy(val)
              } else {
                renderer.send({ setModelScale: { [axis]: val / 100 } });
              }
            }}
            error={errors.scale?.[axis] != null}
            helperText={errors.scale?.[axis]?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  %
                </InputAdornment>
              ),
            }}
            sx={{
              // width: 150,
              display: 'block',
            }}
          />
        </Box>
      ))}
      <FormControlLabel
        control={<Switch defaultChecked />}
        label="Scale All Axes Together"
        onChange={(e, checked) => setScaleAxesTogether(checked)}
        sx={{
          display: 'block',
          mt: 2,
        }}
      />
      <Button
        onClick={() => {
          scaleAllBy(25.4 * 100)
        }}
        sx={{
          mt: 2,
          mr: 2,
        }}
      >
        Inches to MM
      </Button>
      <Button
        onClick={() => {
          scaleAllBy(100)
        }}
        sx={{
          mt: 2,
          float: 'right',
        }}
      >
        Reset
      </Button>
    </>
  )
}

export default ScaleButtons
