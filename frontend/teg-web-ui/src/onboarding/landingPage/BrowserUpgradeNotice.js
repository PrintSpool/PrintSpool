import React from 'react'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
} from '@material-ui/core'

// import beakerSVG from 'url:./images/beaker.svg'

import BrowserUpgradeNoticeStyles from './BrowserUpgradeNoticeStyles'

//
// <Typography gutterBottom>
//   {
//     `
//       Teg requires the Beaker Browser to connect to 3D printers.
//     `
//   }
// </Typography>
// <Typography gutterBottom>
//   {
//     `
//       Beaker is a Browser for the Peer-to-Peer Web - a new version of the internet that works offline and where everyone owns their own data.
//     `
//   }
// </Typography>
// <Typography gutterBottom>
//   {
//     `
//     Teg uses Beaker to enable better
//     experiences such as automatically connecting to your
//     3D printers so you don't have to memorize their IP addresses.
//   `
//   }
// </Typography>
// <Typography gutterBottom>
//   Please install Beaker and go to
//   {' '}
//   <a href="dat://tegapp.io">dat://tegapp.io</a>
//   .
// </Typography>
// <a
//   href="https://beakerbrowser.com"
//   target="_blank"
//   rel="noopener noreferrer"
//   className={classes.buttonLink}
// >
//   <Button
//     variant="contained"
//     color="primary"
//     className={classes.button}
//   >
//     Download Beaker
//   </Button>
// </a>

// <Grid item xs={12} sm={4} md={3}>
//   <img
//     alt="Beaker Browser"
//     src={beakerSVG}
//     className={classes.logo}
//   />
// </Grid>
// <Grid item xs={12} sm={8} md={9}>
//
// </Grid>


const BrowserUpgradeNotice = ({
  open,
  onClose,
}) => {
  const classes = BrowserUpgradeNoticeStyles()

  return (
    <Dialog
      maxWidth="lg"
      fullWidth
      onClose={onClose}
      aria-labelledby="browser-upgrade-title"
      open={open}
    >
      <DialogTitle id="browser-upgrade-title" onClose={onClose}>
        Teg launches this Fall
        {/* Upgrade to Beaker */}
      </DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography paragraph>
              Be ready for Teg's launch this Fall, 2019. Join our mailing list to get the latest updates.
            </Typography>
            <iframe
              title="Subscribe to Teg"
              className="mj-w-res-iframe"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src="https://app.mailjet.com/widget/iframe/487u/hQA"
              width="100%"
            />

            <script
              type="text/javascript"
              src="https://app.mailjet.com/statics/js/iframeResizer.min.js"
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default BrowserUpgradeNotice
