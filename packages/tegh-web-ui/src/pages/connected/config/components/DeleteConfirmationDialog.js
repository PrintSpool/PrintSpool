import React from 'react'
import { compose } from 'recompose'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@material-ui/core'

const DELETE_CONFIG = gql`
  mutation deleteConfig($input: DeleteConfigInput!) {
    deleteConfig(input: $input)
  }
`

const enhance = compose(
  withRouter,
  Component => (props) => {
    const {
      id,
      collection,
      printerID,
      history,
    } = props

    const input = {
      configFormID: id,
      collection,
      printerID,
    }

    return (
      <Mutation
        mutation={DELETE_CONFIG}
        variables={{ input }}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            history.go(-2)
          }
        }}
      >
        {
          (deleteConfig, { called, error }) => {
            if (error != null) return <div>{JSON.stringify(error)}</div>
            if (called) return <div />
            return (
              <Component
                onDelete={deleteConfig}
                {...props}
              />
            )
          }
        }
      </Mutation>
    )
  },
)

const FormDialog = ({
  title,
  open,
  history,
  onDelete,
  type,
}) => (
  <Dialog
    open={open}
    onClose={() => history.goBack()}
    aria-labelledby="alert-dialog-description"
  >
    <DialogTitle>
      Delete
      {' '}
      {title}
      ?
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {
          `This ${type}'s configuration will be
          perminently deleted.`
        }
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => history.goBack()}>
        Cancel
      </Button>
      <Button onClick={onDelete}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
)

export const Component = FormDialog
export default enhance(FormDialog)
