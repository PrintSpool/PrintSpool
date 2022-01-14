import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// // eslint-disable-next-line import/no-unresolved
// import cubesSVG from 'url:./images/cubes.svg'
// // eslint-disable-next-line import/no-unresolved
// import cubesMobileSVG from 'url:./images/cubesMobile.svg'
// // eslint-disable-next-line import/no-unresolved
// import tegLogoSVG from 'url:./images/tegLogo.svg'

import HeroStyles from './HeroStyles'

const isPrintSpoolReleased = false

const Hero = ({ t }) => {
  const classes = HeroStyles()

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.wordmark}>
          <span style={{ fontWeight: 'lighter' }}>Print</span>
          <span>Spool</span>
        </div>
        <div className={classes.topButtons}>
          <Button
            className={classes.topButton}
            component="a"
            href="https://github.com/PrintSpool/PrintSpool"
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
      </div>
      <div className={classes.centeredContent}>
        <div>
          <Typography
            variant="body1"
            component="div"
            className={classes.taglinePart1}
          >
            {t('hero.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            className={classes.callToActionButton}
            component={React.forwardRef((props, ref) => {
              if (isPrintSpoolReleased) {
                return (
                  <Link to="/get-started" innerRef={ref} {...props} />
                )
              } else {
                return (
                  // eslint-disable-next-line
                  <a
                    href="https://f39c45f8.sibforms.com/serve/MUIEAE-_A4uUHTi1cRelH4oP-Fi21skRjdhqT4Bqd6PTwzyx7w-HnThYJlxGsbdxMQhtyFPhivfG60tOvTWmQL5P3eDxDzZHCh_G6JN0VdspzLX4ZgZzTm3XdfobEG6UCE4LkzTzLUQlPvL9HaSe5IWfaTyuG5RyZ2WJYvkxmHe-xTQ4ugNxkuPPf0l8PacyYVdkhZME24181ayK"
                    ref={ref}
                    {...props}
                  />
                )
              }
            })}
          >
            {t('hero.callToActionButton')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Hero
