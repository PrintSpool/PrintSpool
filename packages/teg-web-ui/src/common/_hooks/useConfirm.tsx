import React from 'react'
import { useConfirm as muiUseConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'
import ButtonBase from '@material-ui/core/ButtonBase'

const useConfirm = () => {
  const muiConfirm = muiUseConfirm()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  return cb => async (...args) => {
    const {
      fn,
      onCancel = () => {},
      ...options
    } = cb()

    try {
      await muiConfirm(options)
    } catch {
      // cancel confirmation dialog is rejected
      onCancel()
      return
    }

    try {
      return await fn(...args)
    } catch (e) {
      enqueueSnackbar(
        `Error: ${e.message}`,
        {
          variant: 'error',
          persist: true,
          action: (key) => (
            <ButtonBase
              onClick={() => closeSnackbar(key)}
              style={{ marginRight: 16 }}
            >
                Dismiss
            </ButtonBase>
          ),
        }
      )
      onCancel()
    }
  }
}

export default useConfirm
