import React from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Grid,
  Typography,
  Hidden,
} from '@material-ui/core'

import cubesSVG from 'url:./images/cubes.svg'
import cubesMobileSVG from 'url:./images/cubesMobile.svg'
import tegLogoSVG from 'url:./images/tegLogo.svg'

import HeroStyles from './HeroStyles'

const Hero = ({ t }) => {
  const classes = HeroStyles()

  return (
    <div className={classes.root}>
      <div className={classes.topButtons}>
        <Button
          className={classes.topButton}
          component="a"
          href="https://github.com/tegapp/teg"
        >
          Github
        </Button>
        <Button
          className={classes.topButton}
          variant="outlined"
          component={React.forwardRef((props, ref) => (
            <Link to="/login" innerRef={ref} {...props} />
          ))}
        >
          Log in
        </Button>
      </div>
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
                component={React.forwardRef((props, ref) => (
                  <Link to="/get-started/" innerRef={ref} {...props} />
                ))}
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
