import React from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Typography,
  Link as MUILink,
} from '@material-ui/core'

import teghLogoSVG from './images/teghLogo.svg'

import FooterStyles from './FooterStyles'

const Footer = ({ t }) => {
  const classes = FooterStyles()

  return (
    <Typography
      component="div"
      variant="body2"
      className={classes.root}
    >
      <div className={classes.gradient}>
        <img
          alt="Tegh"
          src={teghLogoSVG}
          className={classes.logo}
        />
        <div className={classes.logoAdjacent}>
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
      </div>
      <div className={classes.navigation}>
        <div className={classes.navigationRight}>
          <Typography
            variant={{ xs: 'body2', md: 'body1' }}
            paragraph
            className={classes.connectTitle}
          >
            {t('footer.connectTitle')}
            {' '}
            <MUILink
              className={classes.freenode}
              href="https://webchat.freenode.net/?channels=%23tegh&uio=d4"
            >
              freenode #tegh
            </MUILink>
          </Typography>
        </div>
      </div>
    </Typography>
  )
}

export default Footer
