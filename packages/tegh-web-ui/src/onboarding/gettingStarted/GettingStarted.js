import React, { useMemo, useState } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@material-ui/core'

import { parseInviteCode } from 'graphql-things'

import { LiveSubscription } from '../../common/LiveSubscription'

import TeghApolloProvider from '../../printer/common/frame/higherOrderComponents/TeghApolloProvider'
import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

import GettingStartedStyles from './GettingStartedStyles'

import Step1InstallTegh from './steps/Step1InstallTegh'
import Step2Connect from './steps/Step2Connect'
import Step3Setup from './steps/Step3Setup'
import Step4Backup from './steps/Step4Backup'

const DEVICES_SUBSCRIPTION = gql`
  subscription DevicesSubscription {
    live {
      patch { op, path, from, value }
      query {
        isConfigured
        devices {
          id
          type
        }
      }
    }
  }
`

const GettingStarted = ({
  location,
  history,
  match,
}) => {
  const classes = GettingStartedStyles()

  const [skippedStep3, setSkippedStep3] = useState(false)

  const steps = [
    'Install',
    'Connect',
    'Printer Setup',
    'Done',
  ]

  const step = parseInt(match.params.step || 1, 10)
  const invite = useMemo(() => {
    const inviteCodeParam = location.search.replace('?invite=', '')

    if (inviteCodeParam.length === 0) {
      return null
    }

    return parseInviteCode(inviteCodeParam)
  })

  return (
    <div className={classes.root}>
      <StaticTopNavigation title={() => 'Welcome to Tegh!'} />
      <Stepper activeStep={step - 1} className={classes.stepper}>
        {steps.map((label, i) => (
          <Step key={label}>
            <StepLabel
              optional={i === 2 && (
                <Typography variant="caption">First Time Only</Typography>
              )}
              completed={i < step - 1 && (i !== 2 || !skippedStep3)}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      { step === 1 && (
        <Step1InstallTegh history={history} className={classes.content} />
      )}
      { step === 2 && (
        <Step2Connect history={history} className={classes.content} />
      )}
      { step >= 3 && (
        <TeghApolloProvider hostIdentity={invite}>
          {step === 3 && (
            <LiveSubscription
              subscription={DEVICES_SUBSCRIPTION}
            >
              {({ data, loading, error }) => {
                if (error) {
                  return (
                    <div>
                      {JSON.stringify(error)}
                    </div>
                  )
                }

                return (
                  <Step3Setup
                    connecting={loading}
                    location={location}
                    history={history}
                    setSkippedStep3={setSkippedStep3}
                    className={classes.content}
                    invite={invite}
                    data={data}
                  />
                )
              }}
            </LiveSubscription>
          )}
          {step === 4 && (
            <Query
              query={gql`
                query {
                  jobQueue {
                    name
                  }
                }
              `}
              fetchPolicy="network-only"
            >
              {({
                data,
                loading,
                error,
              }) => {
                if (loading) return <div />
                if (error != null) {
                  return (
                    <div>
                      <h1>Error</h1>
                      {JSON.stringify(error)}
                    </div>
                  )
                }
                return (
                  <Step4Backup
                    history={history}
                    invite={invite}
                    className={classes.content}
                    data={data}
                  />
                )
              }}
            </Query>
          )}
        </TeghApolloProvider>
      )}
    </div>
  )
}

export default GettingStarted
