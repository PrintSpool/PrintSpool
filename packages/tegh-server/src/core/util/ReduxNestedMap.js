export const DELETE_ITEM = Symbol('DELETE_ITEM')

const ReduxNestedMap = ({
  singularReducer,
  keyPath = []
}) => {
  const createOne = (state, action) => {
    state.updateIn(keyPath, items => {
      const item = singularReducer(null, action)
      return items.set(item.id, item)
    })
  )

  const updateEach = (state, action) => (
    state.updateIn(keyPath, items => {
      return items
        .map(item => singularReducer(item, action))
        .filter(item => item != DELETE_ITEM)
    }
  )

  const updateOne = (state, action, id) => (
    state.updateIn(keyPath, items => {
      const nextItemState = singularReducer(items.get(id), action)
      if (nextItemState == DELETE_ITEM) {
        return items.delete(item.id)
      }
      return items.set(id, nextItemState)
    })
  )

  return {
    updateEach
    updateOne
  }
}

export ReduxNestedMap
