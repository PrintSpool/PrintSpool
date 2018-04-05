const getTask = state => id => {
  return state.spool.tasks.get(id)
}

export default getTask
