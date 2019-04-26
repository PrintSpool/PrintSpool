import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Stepper,
  Step,
  StepLabel,
  Button,
} from '@material-ui/core'

import { parseInviteCode } from 'graphql-things'

import TeghApolloProvider from '../pages/connected/frame/higherOrderComponents/TeghApolloProvider'
import StaticTopNavigation from '../topNavigation/StaticTopNavigation'

import GettingStartedStyles from './GettingStartedStyles'

import Step1InstallTegh from './steps/Step1InstallTegh'
import Step2Connect from './steps/Step2Connect'
import Step3Setup from './steps/Step3Setup'

const GettingStarted = ({
  location,
  history,
  match,
}) => {
  const classes = GettingStartedStyles()

  const steps = [
    'Install',
    'Connect',
    // 'Set up User / Printer',
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
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div className={classes.content}>
        { step === 1 && (
          <Step1InstallTegh history={history} />
        )}
        { step === 2 && (
          <Step2Connect history={history} />
        )}
        { step === 3 && (
          <TeghApolloProvider hostIdentity={invite}>
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
                  <Step3Setup history={history} invite={invite} data={data} />
                )
              }}
            </Query>
          </TeghApolloProvider>
        )}
      </div>
      <div className={classes.buttons}>
        <Button
          className={classes.button}
          component={props => (
            <Link
              to={step === 1 ? '/' : `/get-started/${step - 1}`}
              {...props}
            />
          )}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={step === 2 || step === 3}
          className={classes.button}
          component={props => (
            <Link
              to={step === 3 ? '/' : `/get-started/${step + 1}`}
              {...props}
            />
          )}
        >
          {step === 3 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default GettingStarted
