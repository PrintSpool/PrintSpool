import React from 'react'
import { Route, Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import RotateButtons from './RotateButtons.view';
import ScaleButtons from './ScaleButtons.view';
import MirrorButtons from './MirrorButtons.view';
import MoveButtons from './MoveButtons.view';

const EditTabsMobileView = ({
  basePath,
  renderer,
}) => {
  const { action } = useParams();
  const editPath = `${basePath}/:filename/edit`

  const actions = [
    { slug: 'rotate', label: 'Rotate' },
    { slug: 'scale', label: 'Scale' },
    { slug: 'flip', label: 'Flip' },
    { slug: 'move', label: 'Move' },
  ]

  return (
    <Box
      sx={{
        zIndex: 10,
        gridRow: 'ft',
        gridColumn: 'main',
        alignSelf: 'end',
      }}
    >
      <Route exact path={`${editPath}/rotate`}>
        <RotateButtons renderer={renderer} />
      </Route>
      <Route exact path={`${editPath}/scale`}>
        <ScaleButtons renderer={renderer} />
      </Route>
      <Route exact path={`${editPath}/flip`}>
        <MirrorButtons renderer={renderer} />
      </Route>
      <Route exact path={`${editPath}/move`}>
        <MoveButtons renderer={renderer} />
      </Route>

      <Tabs
        value={actions.findIndex(a => a.slug === action)}
        variant="scrollable"
        scrollButtons="auto"
      >
        { actions.map(({ slug, label }) => (
          <Tab
            key={slug}
            label={label}
            component={Link}
            to={`./${slug || ''}`}
          />
        ))}
      </Tabs>
      {/* <Box
        sx={{ mt: 2 }}
      >
        <Button
          variant="outlined"
          component={Link}
          to="../"
        >
          Back
        </Button>
      </Box> */}
    </Box>
  )
}

export default EditTabsMobileView;
