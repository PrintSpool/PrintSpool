import React from 'react'
import { Link } from 'react-router-dom'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

import FormikSchemaForm from '../FormikSchemaForm/index'
import StatusFilter from '../../../../common/StatusFilter'
// import Loading from '../../../../common/Loading'
import LoadingOverlay from '../../../../common/LoadingOverlay'

const UpdateDialogView = ({
  title,
  name = null,
  id = null,
  open,
  onClose,
  onSubmit,
  submitting,
  error: externalError,
  data,
  status,
  hasPendingUpdates = false,
  deleteButton = false,
  transformSchema = schema => schema,
  register,
  control,
  errors,
}) => {
  // console.log({ data }, data.schemaForm.schema)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={onSubmit}>
        <LoadingOverlay loading={submitting}>
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
                register={register}
                control={control}
                errors={errors}
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
            <Button onClick={onClose}>
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
        </LoadingOverlay>
      </form>
    </Dialog>
  )
}

export default UpdateDialogView
