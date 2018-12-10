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

export const UPDATE_DIALOG_FRAGMENT = gql`
  fragment UpdateDialogFragment on ConfigForm {
    __typename
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
          if (error != null) {
            return (
              <div>
                <h1>Error</h1>
                {JSON.stringify(error)}
              </div>
            )
          }

          const configFormModel = (() => {
            if (data.materials != null) return data.materials[0]

            const config = data.printerConfigs[0]
            return (config.plugins || config.components)[0]
          })()

          return (
            <Component
              collection={collection}
              open={open}
              data={configFormModel}
              client={client}
              printerID={variables.printerID}
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
      printerID,
      data,
      history,
    } = props

    const input = {
      configFormID: data.id,
      modelVersion: data.modelVersion,
      printerID,
      collection,
    }

    return (
      <Mutation
        mutation={SUBMIT_UPDATE_DIALOG}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            history.go(-1)
          }
        }}
      >
        {
          (submitUpdateDialog, { called, error }) => {
            if (error != null) return <div>{JSON.stringify(error)}</div>
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
  deleteButton = false,
  transformSchema = schema => schema,
}) => (
  <Dialog
    open={open}
    onClose={() => history.goBack()}
    aria-labelledby="form-dialog-title"
    maxWidth="md"
    fullWidth
  >
    { console.log(data.model) }
    <Formik
      initialValues={data.model}
      validate={validate}
      onSubmit={onSubmit}
    >
      {() => (
        <Form>
          <DialogTitle id="form-dialog-title">{title || name || id}</DialogTitle>
          <DialogContent>
            <FormikSchemaForm
              schema={transformSchema(data.schemaForm.schema)}
              form={data.schemaForm.form}
            />
          </DialogContent>
          <DialogActions>
            { deleteButton && (
              <div style={{ flex: 1 }}>
                <Link to="delete" style={{ textDecoration: 'none' }}>
                  <Button color="secondary">
                    Delete
                  </Button>
                </Link>
              </div>
            )}
            <Button onClick={() => history.goBack()}>
              Cancel
            </Button>
            <Button type="submit" color="primary">
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
