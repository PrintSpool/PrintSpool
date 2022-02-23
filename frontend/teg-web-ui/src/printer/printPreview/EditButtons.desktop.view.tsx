import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';

import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import OpenWithIcon from '@mui/icons-material/OpenWith';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import FlipIcon from '@mui/icons-material/Flip';

import ButtonGroup from '@mui/material/ButtonGroup';
import Popover from '@mui/material/Popover';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const EditButtonsDesktopView = ({
  printFile,
  slicerEngine,
  renderer,
}) => {
  const [scaleAxesTogether, setScaleAxesTogether] = useState(true)

  const [popover, setPopover] = useState({
    mode: null, // One of rotate, scale, move or mirror
    el: null,
  });

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
    <Box
      sx={{
        mt: 2,
        mb: 2,
        zIndex: 2,
        position: 'relative',
        gridArea: 'main',
        justifySelf: 'left',
        alignSelf: 'center',
        display: {
          xs: 'none',
          md: 'flex',
        },
        flexDirection: 'column',
      }}
    >
      <ButtonGroup
        variant="outlined"
        orientation="vertical"
        disabled={!printFile.isMesh}
        aria-label="3d model manipulation"
        sx={{
          ml: -4,
          "& .MuiButton-root": {
            pl: 3,
            pr: 1,
          },
        }}
      >
        {/* Rotate */}
        <Button
          aria-label="rotate"
          size="large"
          aria-describedby="rotatePopover"
          onClick={(e) => setPopover({ mode: 'rotate', el: e.currentTarget })}
        >
          <ThreeSixtyIcon/>
        </Button>
        <Popover
          id="rotatePopover"
          open={popover.mode === 'rotate'}
          anchorEl={popover.el}
          keepMounted
          onClose={() => setPopover((p) =>
            p.mode === 'rotate' ? { mode: null, el: null } : p
          )}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'center',
          }}
          transformOrigin={{
            horizontal: 'left',
            vertical: 'center',
          }}
        >
          <Box sx={{
            m: 2,
          }}>
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
                  width: 200,
                  mt: 2,
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
          </Box>
        </Popover>
        {/* Scale */}
        <Button
          aria-label="scale"
          size="large"
          aria-describedby="scalePopover"
          onClick={(e) => setPopover({ mode: 'scale', el: e.currentTarget })}
        >
          <PhotoSizeSelectSmallIcon/>
        </Button>
        <Popover
          id="scalePopover"
          open={popover.mode === 'scale'}
          keepMounted
          anchorEl={popover.el}
          onClose={() => setPopover((p) =>
            p.mode === 'scale' ? { mode: null, el: null } : p
          )}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'center',
          }}
          transformOrigin={{
            horizontal: 'left',
            vertical: 'center',
          }}
        >
          <Box sx={{
            m: 2,
          }}>
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
          </Box>
        </Popover>
        {/* Mirror */}
        <Button
          aria-label="mirror"
          size="large"
          aria-describedby="mirrorPopover"
          onClick={(e) => setPopover({ mode: 'mirror', el: e.currentTarget })}
        >
          <FlipIcon/>
        </Button>
        <Popover
          id="mirrorPopover"
          open={popover.mode === 'mirror'}
          anchorEl={popover.el}
          keepMounted
          onClose={() => setPopover((p) =>
            p.mode === 'mirror' ? { mode: null, el: null } : p
          )}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'center',
          }}
          transformOrigin={{
            horizontal: 'left',
            vertical: 'center',
          }}
        >
          <Box sx={{
            m: 2,
          }}>
            {['x', 'y', 'z'].map((axis) => (
              <FormControlLabel
                key={axis}
                control={<Switch/>}
                label={`Flip ${axis.toUpperCase()}`}
                onChange={(e, checked) => {
                  renderer.send({ setModelMirroring: { [axis]: checked}})
                }}
                sx={{
                  display: 'block',
                  mt: 1,
                }}
              />
            ))}
          </Box>
        </Popover>
        {/* Move */}
        { slicerEngine.allowsPositioning &&
          <Button
            aria-label="move"
            size="large"
            aria-describedby="movePopover"
            onClick={(e) => setPopover({ mode: 'move', el: e.currentTarget })}
          >
            <OpenWithIcon/>
          </Button>
        }
        <Popover
          id="movePopover"
          open={popover.mode === 'move'}
          anchorEl={popover.el}
          keepMounted
          onClose={() => setPopover((p) =>
            p.mode === 'move' ? { mode: null, el: null } : p
          )}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'center',
          }}
          transformOrigin={{
            horizontal: 'left',
            vertical: 'center',
          }}
        >
          <Box sx={{
            m: 2,
          }}>
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
          </Box>
        </Popover>
      </ButtonGroup>
    </Box>
  )
}

export default EditButtonsDesktopView
