import React, { useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import Grid from '@mui/material/Grid'
import Hidden from '@mui/material/Hidden'
import Typography from '@mui/material/Typography'

import { useTranslation, Trans } from 'react-i18next'
import { useSnackbar } from 'notistack'

import tegMockupSVG from 'url:./images/tegMockup.png'

import ScrollSpyTopNavigation from '../../common/topNavigation/ScrollSpyTopNavigation'
import Hero from './Hero'
import Header from './Header'

import KofiCupLogoSVG from 'url:./images/kofiCupLogo.svg'

import automaticPrintingGIF from 'url:./images/automaticPrinting.gif'
import printQueueingGIF from 'url:./images/printQueueing.gif'

import Footer from './Footer'

import LandingPageStyles from './LandingPageStyles'

const NO_CURRENCY = {}

const LandingPage = () => {
  const classes = LandingPageStyles()
  const { t } = useTranslation('LandingPage')
  const { enqueueSnackbar } = useSnackbar()

  const [currency, setCryptoCurrency] = useState(NO_CURRENCY)
  const cryptoDialogOpen = currency.address != null

  const onCryptoDonationClick = nextCurrency => async () => {
    setCryptoCurrency(nextCurrency)
    await navigator.clipboard.writeText(nextCurrency.address)
    enqueueSnackbar(
      t('contribute.cryptoAddressCopied', nextCurrency),
    )
  }

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
    'secure',
    'multiPrinter',
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
        spacing={4}
        className={classes.content}
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

        <Hidden mdDown>
          <Grid item xs={12} md={6}>
            <img
              async
              alt=""
              src={tegMockupSVG}
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
          <Header variant="green" title={t('printQueueing.title')} />
        </Grid>

        <Grid item xs={12} md={6} className={classes.animationGridItem}>
          <img
            async
            src={printQueueingGIF}
            alt=""
            className={classes.animation}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ReactMarkdown
            source={t('printQueueing.content')}
            renderers={{
              heading,
              paragraph: largeParagraph,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Header variant="orange" title={t('fullyAutomatic.title')} />
        </Grid>

        <Grid item xs={12} md={6} className={classes.animationGridItem}>
          <img
            async
            src={automaticPrintingGIF}
            alt=""
            className={classes.animation}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ReactMarkdown
            source={t('fullyAutomatic.content')}
            renderers={{
              paragraph: largeParagraph,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Header variant="green" title={t('features.title')} />
        </Grid>

        {features.map(featureKey => (
          <Grid item key={featureKey} xs={12} md={4}>
            <ReactMarkdown
              source={t(`features.${featureKey}`)}
              renderers={{
                heading,
                paragraph,
              }}
            />
          </Grid>
        ))}

        {/* <Grid item xs={12}>
          <Header variant="orange" name="donate" title={t('support.title')} />
        </Grid>

        <Grid item xs={12}>
          <ReactMarkdown
            source={t('support.content')}
            renderers={{
              heading,
              paragraph: largeParagraph,
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

          <Dialog
            open={cryptoDialogOpen}
            onClose={() => setCryptoCurrency(NO_CURRENCY)}
            aria-labelledby="crypto-modal-title"
            aria-describedby="crypto-modal-description"
            fullWidth
            maxWidth="lg"
          >
            <DialogTitle id="crypto-modal-title">
              {t('contribute.cryptoDonationDialogTitle', currency)}
            </DialogTitle>
            <DialogContent id="crypto-modal-description">
              <Typography variant="body1" paragraph>
                {t('contribute.cryptoDonationDialogContent', currency)}
              </Typography>
              <Typography variant="body1" paragraph>
                <img
                  alt=""
                  src={currency.icon}
                  className={classes.donationButtonLogo}
                />
                {currency.address}
              </Typography>
            </DialogContent>
          </Dialog>
        </Grid> */}
      </Grid>

      <Footer t={t} />

    </div>
  );
}

export default LandingPage
