import React, { useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import {
  Grid,
  Hidden,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@material-ui/core'

import { useTranslation, Trans } from 'react-i18next'
import { useSnackbar } from 'notistack'

import teghMockupSVG from './images/teghMockup.png'

import ScrollSpyTopNavigation from '../topNavigation/ScrollSpyTopNavigation'
import Hero from './Hero'
import GreenHeader from './GreenHeader'
import OrangeHeader from './OrangeHeader'

import KofiCupLogoSVG from './images/kofiCupLogo.svg'
import nanoMarkSVG from './images/nanoMark.svg'
import ethereumPNG from './images/ethereumIconSmall.png'

import Footer from './Footer'

import LandingPageStyles from './LandingPageStyles'

const cryptoIcons = {
  nano: nanoMarkSVG,
  ethereum: ethereumPNG,
}

const wallets = {
  nano: 'nano_1cpesa6ushct9zieue8uo981cbz8rbfbjb7h9dw1a3nmibwysyzpipjhfufa',
  ethereum: '0xcfa4ebcac84e806199864b70dcc6a3a463ab62aa',
}

const LandingPage = () => {
  const classes = LandingPageStyles()
  const { t } = useTranslation('LandingPage')
  const { enqueueSnackbar } = useSnackbar()

  const [currency, setCryptoCurrency] = useState()
  const cryptoDialogOpen = currency != null

  const copyNanoDonationURL = useCallback(async () => {
    setCryptoCurrency('Nano')
    await navigator.clipboard.writeText(NANO_WALLET)
    enqueueSnackbar(
      t('contribute.cryptoAddressCopied', { currency: 'Nano' }),
    )
  })

  const copyEthDonationURL = useCallback(async () => {
    setCryptoCurrency('Ethereum')
    await navigator.clipboard.writeText(ETH_WALLET)
    enqueueSnackbar(
      t('contribute.cryptoAddressCopied', { currency: 'Ethereum' }),
    )
  })

  const heading = useCallback(({ children }) => (
    <Typography variant="h6" paragraph>
      {children}
    </Typography>
  ))

  const largeParagraph = useCallback(({ children }) => (
    <Typography variant="body1" paragraph>
      {children}
    </Typography>
  ))

  const paragraph = useCallback(({ children }) => (
    <Typography variant="body2" paragraph>
      {children}
    </Typography>
  ))

  const features = [
    'printQueueing',
    'secure',
    'multiPrinter',
    'automatic',
    'easySetup',
    'openSource',
  ]

  return (
    <div>
      <ScrollSpyTopNavigation />
      <Hero t={t} />

      <div
        style={{
          marginBottom: 50,
        }}
      />

      <Grid
        container
        spacing={32}
        style={{
          marginLeft: -32,
          paddingLeft: 32 + 32,
          paddingRight: 32,
        }}
      >
        <Grid item xs={12} md={6}>
          <Typography variant="h4" paragraph>
            <Trans i18nKey="introduction.title" t={t}>
              1
              <span style={{ color: '#FF7900' }}>
                2
              </span>
              3
            </Trans>
          </Typography>

          <ReactMarkdown
            source={t('introduction.content')}
            renderers={{
              paragraph: largeParagraph,
            }}
          />
        </Grid>

        <Hidden smDown>
          <Grid item md={6}>
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
        </Hidden>

        <Grid item xs={12}>
          <GreenHeader title={t('features.title')} />
        </Grid>

        {features.map(featureKey => (
          <Grid item key={featureKey} xs={6} lg={4}>
            <ReactMarkdown
              source={t(`features.${featureKey}`)}
              renderers={{
                heading,
                paragraph,
              }}
            />
          </Grid>
        ))}

        {/*
        <Grid item xs={12}>
          <OrangeHeader title="How it Works" />
        </Grid>
        */}
        <Grid item xs={12}>
          <OrangeHeader title={t('contribute.title')} />
          <ReactMarkdown
            source={t('contribute.content')}
            renderers={{
              heading,
              paragraph,
            }}
          />
          <Button
            className={classes.donateButton}
            component="a"
            href="https://ko-fi.com/Z8Z5UXF1"
          >
            <img
              alt=""
              src={KofiCupLogoSVG}
              className={classes.donationButtonLogo}
            />
            {t('contribute.kofiButton')}
          </Button>
          <Button
            className={classes.donateButton}
            onClick={copyNanoDonationURL}
          >
            <img
              alt=""
              src={cryptoIcons.nano}
              className={classes.donationButtonLogo}
            />
            {t('contribute.cryptoDonationButton', { currency: 'Nano' })}
          </Button>
          <Button
            className={classes.donateButton}
            onClick={copyEthDonationURL}
          >
            <img
              alt=""
              src={cryptoIcons.ethereum}
              className={classes.donationButtonLogo}
            />
            {t('contribute.cryptoDonationButton', { currency: 'Ethereum' })}
          </Button>

          <Dialog
            open={cryptoDialogOpen}
            onClose={() => setCryptoCurrency(null)}
            aria-labelledby="nano-modal-title"
            aria-describedby="nano-modal-description"
            fullWidth
            maxWidth="lg"
          >
            <DialogTitle id="nano-modal-title">
              {t('contribute.cryptoDonationDialogTitle', { currency })}
            </DialogTitle>
            <DialogContent id="nano-modal-description">
              <Typography variant="body1" paragraph>
                {t('contribute.cryptoDonationDialogContent', { currency })}
              </Typography>
              <Typography variant="body1" paragraph>
                <img
                  alt=""
                  src={cryptoIcons[(currency || '').toLowerCase()]}
                  className={classes.donationButtonLogo}
                />
                {wallets[(currency || '').toLowerCase()]}
              </Typography>
            </DialogContent>
          </Dialog>
        </Grid>
      </Grid>

      <Footer t={t} />

    </div>
  )
}

export default LandingPage
