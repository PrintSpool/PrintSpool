import { useConfirm as muiUseConfirm } from 'material-ui-confirm'
import { useSnackbar } from 'notistack'

const useConfirm = () => {
  const muiConfirm = muiUseConfirm()
  const { enqueueSnackbar } = useSnackbar()

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
        `Error: ${e?.message}`,
        {
          variant: 'error',
          persist: true,
        }
      )
      onCancel()
    }
  }
}

export default useConfirm
