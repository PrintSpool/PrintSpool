import React, { useState } from 'react'

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
import RotateButtons from './RotateButtons.view';
import ScaleButtons from './ScaleButtons.view';
import MirrorButtons from './MirrorButtons.view';
import MoveButtons from './MoveButtons.view';

const EditButtonsDesktopView = ({
  printFile,
  slicerEngine,
  renderer,
}) => {
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
            <RotateButtons renderer={renderer} />
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
            <ScaleButtons renderer={renderer} />
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
            <MirrorButtons renderer={renderer} />
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
            <MoveButtons renderer={renderer}/>
          </Box>
        </Popover>
      </ButtonGroup>
    </Box>
  )
}

export default EditButtonsDesktopView
