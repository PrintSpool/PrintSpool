import React from 'react'
import { compose, withProps } from 'recompose'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import { Formik, Form } from 'formik'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

import FormikSchemaForm from '../FormikSchemaForm/index'
import withValidate from '../FormikSchemaForm/withValidate'
import StatusFilter from '../../../../common/StatusFilter'

export const UPDATE_DIALOG_FRAGMENT = gql`
  fragment UpdateDialogFragment on ConfigForm {
    id
    model
    modelVersion
    schemaForm {
      schema
      form
    }
  }
`

const SUBMIT_UPDATE_DIALOG = gql`
  mutation submitUpdateDialog($input: UpdateConfigInput!) {
    updateConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const enhance = compose(
  withRouter,
  Component => (({
    query,
    variables,
    open,
    ...props
  }) => {
    const { collection } = props

    if (!open) return <div />
    return (
      <Query
        query={query}
        variables={variables}
        fetchPolicy="network-only"
      >
        {({
          loading,
          error,
          data,
          client,
        }) => {
          if (loading) return <div />
          if (error) {
            throw error
          }

          const configFormModel = (() => {
            if (data.materials != null) {
              return data.materials[0]
            }

            const machine = data.machines[0]

            if (machine.configForm != null) {
              return machine
            }

            return (machine.plugins || machine.components)[0]
          })().configForm

          return (
            <Component
              collection={collection}
              open={open}
              data={configFormModel}
              client={client}
              machineID={variables.machineID}
              {...props}
            />
          )
        }}
      </Query>
    )
  }),
  Component => (props) => {
    const {
      collection,
      machineID,
      data,
      history,
    } = props

    const input = {
      configFormID: data.id,
      modelVersion: data.modelVersion,
      machineID,
      collection,
    }

    return (
      <Mutation
        mutation={SUBMIT_UPDATE_DIALOG}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            history.push('../')
          }
        }}
      >
        {
          (submitUpdateDialog, { called, error }) => {
            if (error != null) {
              throw error
            }

            if (called) return <div />

            return (
              <Component
                onSubmit={(model) => {
                  submitUpdateDialog({
                    variables: {
                      input: {
                        ...input,
                        model,
                      },
                    },
                  })
                }}
                {...props}
              />
            )
          }
        }
      </Mutation>
    )
  },
  withProps(({ data }) => ({
    schema: data.schemaForm.schema,
  })),
  withValidate,
)

const UpdateDialog = ({
  title,
  name,
  id,
  open,
  history,
  onSubmit,
  data,
  validate,
  status,
  hasPendingUpdates,
  deleteButton = false,
  transformSchema = schema => schema,
}) => (
  <Dialog
    open={open}
    onClose={() => history.push('../')}
    aria-labelledby="form-dialog-title"
    maxWidth="md"
    fullWidth
  >
    <Formik
      initialValues={data.model}
      validate={validate}
      onSubmit={onSubmit}
    >
      {props => (
        <Form>
          <DialogTitle id="form-dialog-title">{title || name || id}</DialogTitle>
          <StatusFilter
            status={hasPendingUpdates ? 'UPDATES_PENDING' : status}
            not={['PRINTING', 'UPDATES_PENDING']}
            title={() => {
              if (hasPendingUpdates) {
                return (
                  'Pending Updates: Configuration diabled while updating Teg'
                )
              }
              return (
                `Configuration disabled while ${status.toLowerCase()}`
              )
            }}
            lighten
          >
            <DialogContent>
              <FormikSchemaForm
                schema={transformSchema(data.schemaForm.schema)}
                form={data.schemaForm.form}
                values={props.values}
              />
            </DialogContent>
          </StatusFilter>
          <DialogActions>
            { deleteButton && (
              <div style={{ flex: 1 }}>
                <Link to="delete" style={{ textDecoration: 'none' }}>
                  <Button
                    color="secondary"
                    disabled={hasPendingUpdates || status === 'PRINTING'}
                  >
                    Delete
                  </Button>
                </Link>
              </div>
            )}
            <Button onClick={() => history.push('../')}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={hasPendingUpdates || status === 'PRINTING'}
            >
              Save
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
)

export const Component = UpdateDialog
export default enhance(UpdateDialog)
