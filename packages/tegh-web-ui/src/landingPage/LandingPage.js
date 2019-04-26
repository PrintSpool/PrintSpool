import React from 'react'

import {
  Grid,
  Typography,
} from '@material-ui/core'

import teghMockupSVG from './images/teghMockup.png'

import ScrollSpyTopNavigation from '../topNavigation/ScrollSpyTopNavigation'
import Hero from './Hero'
// import InstallBeaker from './InstallBeaker'
// import GreenHeader from './GreenHeader'
// import OrangeHeader from './OrangeHeader'

const LandingPage = () => (
  <div>
    <ScrollSpyTopNavigation />
    <Hero />

    <div
      style={{
        marginBottom: 50,
      }}
    />

    <Grid
      container
      style={{
        paddingLeft: 100,
        paddingRight: 100,
      }}
    >
      <Grid item xs={6}>
        <Typography variant="h4" paragraph>
          Worry Less.
          {' '}
          <span style={{ color: '#FF7900' }}>
            Create
          </span>
          {' '}
          More.
        </Typography>

        <Typography variant="body1" paragraph>
          Tegh is a printing software designed from the ground up to streamline your 3D printing experience. Easily queue up prints without managing complicated file systems.
        </Typography>

        <Typography variant="body1" paragraph>
          To manage prints remotely Tegh is built on top of encrypted, distributed web technologies so you can
          use your 3D printer from anywhere in the world
          just as easily as from your home!
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <img
          alt="Screenshot of Tegh"
          src={teghMockupSVG}
          style={{
            width: '60%',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'block',
          }}
        />
      </Grid>

      {/*
      <Grid item xs={12}>
        <GreenHeader title="Features" />
      </Grid>

      <Grid item xs={12}>
        <OrangeHeader title="How it Works" />
      </Grid>

      <Grid item xs={12}>
        <InstallBeaker />
      </Grid>
      */}
    </Grid>

  </div>
)

export default LandingPage
