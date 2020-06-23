import { useConfirm as muiUseConfirm } from 'material-ui-confirm'

const useConfirm = () => {
  const muiConfirm = muiUseConfirm()

  return cb => async () => {
    const { fn, ...options } = cb()

    try {
      await muiConfirm(options)
    } catch {
      // cancel confirmation dialog is rejected
      return
    }

    return fn()
  }
}

export default useConfirm
