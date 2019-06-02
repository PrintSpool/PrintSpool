import React, { useCallback, useState } from 'react'
import { useMutation } from 'react-apollo-hooks'
import gql from 'graphql-tag'
import classnames from 'classnames'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@material-ui/core'

import { LiveSubscription } from '../../../../../util/LiveSubscription'
import useSpoolGCodes from '../../../../../common/useSpoolGCodes'

import ExtruderButtons from './ExtruderButtons'
import HistoryChart from './HistoryChart'

import FilamentSwapDialogStyles from './FilamentSwapDialogStyles'

const CHANGE_MATERIAL = gql`
  mutation changeMaterial($input: UpdateConfigInput!) {
    updateConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const MATERIALS_SUBSCRIPTION = gql`
  subscription MaterialsSubscription {
    live {
      patch { op, path, from, value }
      query {
        materials {
          id
          name
        }
      }
    }
  }
`

const MaterialDialog = ({
  onClose,
  open,
  printer,
  component,
}) => {
  const classes = FilamentSwapDialogStyles()

  const {
    configForm,
    name,
    heater: {
      currentTemperature,
      targetTemperature,
    },
  } = component

  const distance = 100

  const removeFilament = useSpoolGCodes(() => ({
    variables: {
      input: {
        printerID: printer.id,
        gcodes: [
          `toggleHeater ${JSON.stringify({ [component.id]: true })}`,
          `moveBy ${JSON.stringify({ [component.address]: distance })}`,
        ],
      },
    },
  }))

  const changeMaterialMutation = useMutation(CHANGE_MATERIAL)

  // TODO: optimistic update to the query
  // TODO: loading spinner
  const onMaterialChange = useCallback((e) => {
    changeMaterialMutation({
      variables: {
        input: {
          configFormID: configForm.id,
          modelVersion: configForm.modelVersion,
          printerID: printer.id,
          collection: 'COMPONENT',
          model: {
            ...configForm.model,
            materialID: e.target.value,
          },
        },
      },
    })
  }, [configForm, printer.id])

  const steps = [
    'Remove old filament',
    'Select new filament',
    'Extrude',
  ]

  const [activeStep, setActiveStep] = useState(0)
  const [heating, setHeating] = useState(false)

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      onClose={onClose}
      aria-labelledby="material-dialog-title"
      open={open}
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogTitle id="material-dialog-title" onClose={onClose}>
        {name}
        {' '}
        Filament Swap
      </DialogTitle>
      <DialogContent className={classes.root}>
        { open && (
          <LiveSubscription
            subscription={MATERIALS_SUBSCRIPTION}
          >
            {(({ data, loading, error }) => {
              if (loading) {
                return <div />
              }

              if (error) {
                return (
                  <div>
                    {JSON.stringify(error)}
                  </div>
                )
              }

              return (
                <React.Fragment>
                  <Stepper activeStep={activeStep} alternativeLabel className={classes.stepper}>
                    {steps.map(step => (
                      <Step key={step}>
                        <StepLabel>{step}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  { activeStep === 0 && (
                    <React.Fragment>
                      <div className={classes.removeFilamentContent}>
                        <Typography variant="h5">
                          Let's start by removing your previous filament
                        </Typography>
                        <Typography variant="body1">
                          When your ready Tegh will heat your extruder to 220° and then retract the filament 100mm out of the extruder.
                        </Typography>
                      </div>
                      <div className={classes.adjustFilament}>
                        <Typography variant="body1" className={classes.adjustFilamentInstructions}>
                          Need to adjust the filament?
                        </Typography>
                        <ExtruderButtons
                          printer={printer}
                          address={component.address}
                          showExtrude={false}
                        />
                      </div>
                    </React.Fragment>
                  )}
                  { activeStep === 1 && (
                    <div>
                      3. Swap in the new filament
                      <TextField
                        label="Material"
                        value={configForm.model.materialID}
                        onChange={onMaterialChange}
                        select
                        fullWidth
                      >
                        { data.materials.map(material => (
                          <MenuItem key={material.id} value={material.id}>
                            {material.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>
                  )}
                  { activeStep === 2 && (
                    <div>
                      <div>
                      4. Wait for the Extruder to reach the new material's target temperature
                      </div>
                      5. Extruder the new filament
                      <ExtruderButtons
                        printer={printer}
                        address={component.address}
                        showRetract={false}
                        extrudeColor="default"
                      />
                    </div>
                  )}
                  <div
                    className={classnames([
                      classes.heatingOverlay,
                      heating && classes.activeHeatingOverlay,
                    ])}
                  >
                    <Typography variant="h5" className={classes.heatingOverlayHeader}>
                      Waiting to reach temperature (
                      {currentTemperature.toFixed(1)}
                      {' / '}
                      {targetTemperature}
                      °C)...
                    </Typography>
                    <HistoryChart
                      className={classes.heatingOverlayChart}
                      data={component.heater.history}
                      materialTarget={component.heater.materialTarget || 220}
                    />
                  </div>
                </React.Fragment>
              )
            })}
          </LiveSubscription>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={heating}
          onClick={() => setActiveStep(activeStep + 1)}
        >
          Skip this Step
        </Button>
        <Button
          color="primary"
          variant="contained"
          disabled={heating}
          onClick={() => {
            if (activeStep === 0) {
              removeFilament()
              setHeating(true)
            }
          }}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MaterialDialog
