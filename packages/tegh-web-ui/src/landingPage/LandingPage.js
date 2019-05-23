import React, { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

import {
  Grid,
  Hidden,
  Typography,
} from '@material-ui/core'

import { useTranslation, Trans } from 'react-i18next'

import teghMockupSVG from './images/teghMockup.png'

import ScrollSpyTopNavigation from '../topNavigation/ScrollSpyTopNavigation'
import Hero from './Hero'
import GreenHeader from './GreenHeader'
// import OrangeHeader from './OrangeHeader'
import Footer from './Footer'

const LandingPage = () => {
  const { t } = useTranslation('LandingPage')

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
      </Grid>

      <Footer t={t} />

    </div>
  )
}

export default LandingPage
