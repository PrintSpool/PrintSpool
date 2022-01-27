import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import Moving from '@mui/icons-material/Moving';
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
  renderer,
  modelScale,
  setModelScale,
  modelDimensions,
  // form,
}) => {
  const [scaleAxesTogether, setScaleAxesTogether] = useState(true)

  const [popover, setPopover] = useState({
    mode: null, // One of rotate, scale, move or mirror
    el: null,
  });

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
        display: 'flex',
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
                defaultValue={0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    renderer.send({
                      setModelRotation: { [axis]: val },
                    });
                  }
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
                  label={axis.toUpperCase()}
                  size="small"
                  value={modelScale[axis] * modelDimensions[axis] || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      const nextScale = val / modelDimensions[axis];
                      const allAxisMultiplier = nextScale / modelScale[axis]

                      setModelScale({
                        ...Object.fromEntries(
                          Object.entries(modelScale).map(([k, v]: [string, number]) =>
                            [k, scaleAxesTogether ? v * allAxisMultiplier : v ]
                          ),
                        ),
                        [axis]: nextScale,
                      } as any)
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        mm
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 150,
                    display: 'block',
                  }}
                />
                <TextField
                  label={axis.toUpperCase()}
                  size="small"
                  value={modelScale[axis] * 100}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      const nextScale = val / 100;
                      const allAxisMultiplier = nextScale / modelScale[axis]

                      setModelScale({
                        ...Object.fromEntries(
                          Object.entries(modelScale).map(([k, v]: [string, number]) =>
                            [k, scaleAxesTogether ? v * allAxisMultiplier : v ]
                          ),
                        ),
                        [axis]: nextScale,
                      } as any)
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        %
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 150,
                    mt: 2,
                    mb: 4,
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
              }}
            />
            <Button
              onClick={() => setModelScale({
                x: 25.4,
                y: 25.4,
                z: 25.4,
              })}
              sx={{
                display: 'block',
                mt: 2,
              }}
            >
              Inches to MM
            </Button>
          </Box>
        </Popover>
        {/* <Button
          aria-label="mirror"
          size="large"
          aria-describedby="mirrorPopover"
          onClick={(e) => setPopover({ mode: 'mirror', el: e.currentTarget })}
        >
          <FlipIcon/>
        </Button> */}
        <Popover
          id="mirrorPopover"
          open={popover.mode === 'mirror'}
          anchorEl={popover.el}
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
            <ButtonGroup orientation="vertical">
              {['x', 'y', 'z'].map((axis) => (
                <Button
                  key={axis}
                >
                  Flip on {axis.toUpperCase()}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Popover>
        <Button
          aria-label="move"
          size="large"
          aria-describedby="movePopover"
          onClick={(e) => setPopover({ mode: 'move', el: e.currentTarget })}
        >
          <Moving/>
        </Button>
        <Popover
          id="movePopover"
          open={popover.mode === 'move'}
          anchorEl={popover.el}
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
                defaultValue={0}
                sx={{
                  display: 'block',
                  width: 150,
                  mt: 2,
                }}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
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
