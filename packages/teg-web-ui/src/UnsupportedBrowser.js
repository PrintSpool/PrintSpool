import React from 'react'
import Typography from '@material-ui/core/Typography'
import DetectRTC from 'detectrtc'

import useStyles from './UnsupportedBrowser.style'
import Paper from '@material-ui/core/Paper'

const UnsupportedBrowser = () => {
  const classes = useStyles()

  const isFacebook = DetectRTC.browser.name.includes('FB_IAB')
  // const isFacebook = true

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h4" paragraph className={classes.header}>
          Thanks for trying Teg!
        </Typography>
        <div className={classes.content}>
          { isFacebook && (
            <>
              <Typography variant="body1" paragraph>
                Unfortunately you are in an unsupported version of Facebook's Browser but
                this is easily fixed:
              </Typography>
              <Typography variant="body1" paragraph>
                <ul>
                  <li>Click the 3 dots at the top of your screen</li>
                  <li>Click "Open in Firefox/Chrome"</li>
                </ul>
              </Typography>
            </>
          )}

          { !isFacebook && (
            <>
              <Typography variant="body1" paragraph>
                Unfortunately your current browser is unsupported.
              </Typography>
              <Typography variant="body1" paragraph>
                Please
                {' '}
                <a href="https://browser-update.org/update-browser.html">
                  upgrade to Firefox or Chrome.
                </a>
              </Typography>
            </>
          )}
          {/* <pre>
            { JSON.stringify(DetectRTC, null, 2) }
          </pre> */}
        </div>
      </Paper>
    </div>
  )
}

export default UnsupportedBrowser
