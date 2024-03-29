import React from 'react'
import { Link } from 'react-router-dom'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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
  developerMode,
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
        developerMode={developerMode}
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
                    color="error"
                    variant="outlined"
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
              variant="contained"
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
