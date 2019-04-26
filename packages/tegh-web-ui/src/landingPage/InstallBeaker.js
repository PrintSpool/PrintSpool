import React from 'react'
// import { Link } from 'react-router-dom'

import {
  Button,
  Grid,
  Typography,
  Hidden,
} from '@material-ui/core'

import beakerSVG from './images/beaker.svg'

const InstallBeaker = () => {
  return (
    <div>
      <img
        alt="Beaker Browser"
        src={beakerSVG}
      />
    </div>
  )
}

export default InstallBeaker
