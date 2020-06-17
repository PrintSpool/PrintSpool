import { useConfirm as muiUseConfirm } from 'material-ui-confirm'

const useConfirm = () => {
  const muiConfirm = muiUseConfirm()

  return cb => async (...args) => {
    const { fn, ...options } = cb(...args)

    try {
      await muiConfirm(options)
    } catch {
      // cancel confirmation dialog is rejected
      return
    }

    return fn(...args)
  }
}

export default useConfirm
