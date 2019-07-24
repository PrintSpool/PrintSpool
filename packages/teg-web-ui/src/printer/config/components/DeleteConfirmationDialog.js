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
      machineID,
      history,
    } = props

    const input = {
      configFormID: id,
      collection,
      machineID,
    }

    return (
      <Mutation
        mutation={DELETE_CONFIG}
        variables={{ input }}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            history.push('../../')
          }
        }}
      >
        {
          (deleteConfig, { called, error }) => {
            if (error != null) {
              throw error
            }

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
    onClose={() => history.push('../')}
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
      <Button onClick={() => history.push('../')}>
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
