import React from 'react'
import { Link } from 'react-router-dom'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

import ConfigForm from '../ConfigForm/ConfigForm'
import StatusFilter from '../../../../common/StatusFilter'
// import Loading from '../../../../common/Loading'
import LoadingOverlay from '../../../../common/LoadingOverlay'
import ConfigFields from '../ConfigForm/ConfigFields'

const UpdateDialogView = ({
  title,
  name = null,
  id = null,
  open,
  onSubmit,
  onClose,
  configForm,
  submitting,
  status,
  deleteButton = false,
  transformSchema = schema => schema,
  hasPendingUpdates = false,
  mutation,
}) => {
  // console.log({ data }, data.schema)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <ConfigForm
        schema={transformSchema(configForm.schema)}
        configForm={configForm}
        mutation={mutation}
        onSubmit={onSubmit}
      >
        <LoadingOverlay loading={submitting}>
          <DialogTitle id="form-dialog-title">{title || name || id}</DialogTitle>
          <StatusFilter
            status={hasPendingUpdates ? 'UPDATES_PENDING' : status}
            not={['UPDATES_PENDING']}
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
              <ConfigFields/>
            </DialogContent>
          </StatusFilter>
          <DialogActions>
            { deleteButton && (
              <div style={{ flex: 1 }}>
                <Link to="delete" style={{ textDecoration: 'none' }}>
                  <Button
                    color="secondary"
                    disabled={hasPendingUpdates}
                  >
                    Delete
                  </Button>
                </Link>
              </div>
            )}
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={hasPendingUpdates}
            >
              Save
            </Button>
          </DialogActions>
        </LoadingOverlay>
      </ConfigForm>
    </Dialog>
  )
}

export default UpdateDialogView
