import React from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Grid,
  Typography,
  Hidden,
} from '@material-ui/core'

import cubesSVG from './images/cubes.svg'
import cubesMobileSVG from './images/cubesMobile.svg'
import teghLogoSVG from './images/teghLogo.svg'

import HeroStyles from './HeroStyles'

const Hero = () => {
  const classes = HeroStyles()

  return (
    <div>
      <div className={classes.root}>
        <div className={classes.centeredContent}>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <img
                alt="Tegh"
                src={teghLogoSVG}
                className={classes.logo}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={classes.taglines}>
                <Typography
                  variant="h4"
                  className={classes.taglinePart1}
                >
                  3D Printing. Simplified.
                </Typography>
                <Hidden smDown>
                  <Typography
                    variant="h4"
                    className={classes.taglinePart2}
                  >
                    Tegh is an all new streamlined 3D printing experience
                  </Typography>
                </Hidden>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  className={classes.callToActionButton}
                  component={props => <Link to="/get-started/" {...props} />}
                >
                  Get Started
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>

      </div>
      <Hidden smUp>
        <img
          alt=""
          src={cubesMobileSVG}
          className={classes.cubes}
        />
      </Hidden>
      <Hidden xsDown>
        <div className={classes.cubes}>
          <img
            alt=""
            src={cubesSVG}
            className={classes.firstInnerCubes}
          />
          <Hidden mdDown>
            <img
              alt=""
              src={cubesMobileSVG}
              className={classes.secondInnerCubes}
            />
          </Hidden>
        </div>
      </Hidden>
    </div>
  )
}

export default Hero
