import React from 'react'

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';

// @ts-ignore
import View3D from './icons/View3D.svg';
// @ts-ignore
import ViewFront from './icons/ViewFront.svg';
// @ts-ignore
import ViewTop from './icons/ViewTop.svg';
// @ts-ignore
import ViewLeft from './icons/ViewLeft.svg';
// @ts-ignore
import ViewRight from './icons/ViewRight.svg';

const CameraPositionButtons = ({
  renderer,
  sx = {},
}) => {
  const cameraPositions = [
    {
      SVG: View3D,
      label: 'View 3D Perspective',
      cameraPosition: 'isometric'
    },
    {
      SVG: ViewFront,
      label: 'View Front',
      cameraPosition: 'front'
    },
    {
      SVG: ViewTop,
      label: 'View Top',
      cameraPosition: 'top'
    },
    {
      SVG: ViewLeft,
      label: 'View Left',
      cameraPosition: 'left'
    },
    {
      SVG: ViewRight,
      label: 'View Right',
      cameraPosition: 'right'
    },
  ]

  return (
    <Box
      sx={{
        mb: 1,
        zIndex: 2,
        position: 'relative',
        gridColumn: 'hd',
        gridRow: 'print',
        alignSelf: 'end',
        ...sx,
      }}
    >
      {
        cameraPositions.map(({ SVG, label, cameraPosition }) => (
          <IconButton
            key={cameraPosition}
            aria-label={label}
            size="large"
            onClick={() => renderer.send({ setCameraPosition: cameraPosition })}
          >
            <SvgIcon>
              <SVG />
            </SvgIcon>
          </IconButton>
        ))
      }
    </Box>
  )
}

export default CameraPositionButtons
