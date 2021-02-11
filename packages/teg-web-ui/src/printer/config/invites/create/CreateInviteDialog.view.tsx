import React from 'react'
import { gql } from '@apollo/client'
import { Formik, Form } from 'formik'
import QRCode from 'qrcode.react'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

import FormikSchemaForm from '../../components/FormikSchemaForm/index'
import getDefaultValues from '../../components/FormikSchemaForm/getDefaultValues'
import useStyles from './CreateInviteDialog.styles'

const STEPS = [
  'Configure your Invite',
  'Share the Invite Code',
]

const createInviteDialogView = ({
  schema,
  form,
  loading,
  inviteURL,
  open,
  history,
  create,
  client,
  validate: validateSchemaForm,
  wizard,
  updateWizard,
}) => {
  const classes = useStyles()
  console.log(getDefaultValues({ schema }), schema)
  return (
    <Dialog
      open={open}
      onClose={() => history.push('../')}
      aria-labelledby="create-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <Formik
        initialValues={{
          model: getDefaultValues({ schema }),
        }}
        validate={(values) => {
          const errors: any = {}

          const modelErrors = validateSchemaForm(values.model)

          if (Object.keys(modelErrors).length === 0) {
            return errors
          }

          return {
            ...errors,
            model: modelErrors,
          }
        }}
        onSubmit={async (values, bag) => {
          console.log('SUMBITTT!!!', wizard.activeStep)
          if (wizard.activeStep === 0) {
            return create({
              variables: {
                input: {
                  model: values.model,
                },
              },
            })
          } else {
            history.push('../')
          }

          // bag.setTouched({})
          bag.resetForm({
            ...values,
            model: getDefaultValues({ schema }),
          })
          // bag.setSubmitting(false)
        }}
      >
        {({ values, setTouched }) => (
          <Form>
            <DialogTitle id="create-dialog-title">
              Invite your friends!
            </DialogTitle>
            <DialogContent style={{ minHeight: '12em' }}>
              <Stepper activeStep={wizard.activeStep}>
                {
                  STEPS.map((label, index) => (
                    <Step key={label} completed={index < wizard.activeStep}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))
                }
              </Stepper>
              {wizard.activeStep === 0 && (() => {
                return (
                  <FormikSchemaForm
                    schema={schema}
                    form={form}
                    path="model."
                  />
                )
              })()}
              {wizard.activeStep === 1 && (
                <div>
                  <Typography variant="body1" paragraph className={classes.shareTitle}>
                    Scan this QR code or use the link bellow it to share access to your 3D printer.
                  </Typography>
                  <div className={classes.qrCode}>
                    <QRCode
                      value={inviteURL}
                      size={300}
                    />
                  </div>
                  <TextField
                    label="Invite URL"
                    InputProps={{ classes: { input: classes.inviteURLField } }}
                    value={inviteURL}
                    fullWidth
                    multiline
                    onClick={event => (event.target as any).select()}
                  />
                  <Typography variant="body2" paragraph className={classes.shareWarning}>
                    Please share the invite code before you leave this page. For security purposes
                    the invite code will no longer be accessible after you leave this page.
                  </Typography>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {wizard.activeStep === 0 && (
                <Button onClick={() => history.push('../')}>
                  Cancel
                </Button>
              )}
              {wizard.activeStep > 0 && (
                <Button
                  onClick={() => {
                    setTouched({})
                    updateWizard({
                      activeStep: wizard.activeStep - 1,
                    })
                  }}
                >
                  Back
                </Button>
              )}
              <Button type="submit" color="primary" disabled={loading}>
                {wizard.activeStep === STEPS.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

export default createInviteDialogView
