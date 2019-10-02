export const STATUS_CHANGED = 'teg/machine/STATUS_CHANGED'

const statusChanged = status => ({
  type: STATUS_CHANGED,
  payload: { status },
})

export default statusChanged
