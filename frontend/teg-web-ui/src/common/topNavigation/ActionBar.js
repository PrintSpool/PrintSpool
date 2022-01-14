import React from 'react'
// import { Link } from 'react-router-dom'

// import {
//   Typography,
//   Hidden,
//   IconButton,
//   // Button,
// } from '@mui/material'

import ActionBarStyles from './ActionBarStyles'

const ActionBar = ({
  actions = () => null,
}) => {
  const classes = ActionBarStyles()

  const actionsJSX = actions({ buttonClass: classes.actionButton })

  return (
    <div className={classes.root}>
      {actionsJSX}
    </div>
  )
}

export default ActionBar
