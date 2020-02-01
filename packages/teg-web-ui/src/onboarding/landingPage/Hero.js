import React from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Grid,
  Typography,
  Hidden,
} from '@material-ui/core'

import { useAuth0 } from '../../common/auth/auth0'

import cubesSVG from './images/cubes.svg'
import cubesMobileSVG from './images/cubesMobile.svg'
import tegLogoSVG from './images/tegLogo.svg'

import HeroStyles from './HeroStyles'

const Hero = ({ t }) => {
  const classes = HeroStyles()

  const { loginWithRedirect } = useAuth0()
  return (
    <div className={classes.root}>
      <Button
        onClick={() => loginWithRedirect({})}
        className={classes.githubButton}
        variant="outlined"
      >
        Log in
      </Button>
      {/*
      <Button
        className={classes.githubButton}
        component="a"
        variant="outlined"
        href="https://github.com/teg/teg"
      >
        Github
      </Button>
      */}
      <div className={classes.centeredContent}>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <img
              alt=""
              src={tegLogoSVG}
              className={classes.logo}
            />
          </Grid>
          <Grid item xs={12} sm={6} className={classes.rightSide}>
            <div className={classes.taglines}>
              <Typography
                variant="h4"
                className={classes.taglinePart1}
              >
                {t('hero.title')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.callToActionButton}
                onClick={() => loginWithRedirect({
                  redirect_uri: `${window.location.protocol}//${window.location.host}/get-started/`,
                })}
              >
                {t('hero.callToActionButton')}
              </Button>
            </div>
          </Grid>
        </Grid>
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
