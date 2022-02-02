import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MUILink from '@mui/material/Link'

import FooterStyles from './FooterStyles'
import WordMark from '../../common/WordMark'

const Footer = ({ t }) => {
  const classes = FooterStyles()

  return (
    <Typography
      component="div"
      variant="body2"
      className={classes.root}
    >
      <div className={classes.gradient}>
        <Typography variant="h2">
          <WordMark/>
        </Typography>
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
      <Typography
        variant="body2"
        component="div"
        paragraph
        className={classes.navigation}
      >
        <div className={classes.navigationLeft}>
          <Link
            to="/privacy-policy"
          >
            {t('footer.privacyPolicy')}
          </Link>
        </div>

        <div className={classes.navigationRight}>
          {t('footer.connectTitle')}
          {' '}
          <MUILink
            href="https://webchat.freenode.net/?channels=%23teg&uio=d4"
          >
            freenode #teg
          </MUILink>
        </div>
      </Typography>
    </Typography>
  )
}

export default Footer
