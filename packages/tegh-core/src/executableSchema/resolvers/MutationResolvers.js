import actionResolver from '../../util/actionResolver'

/* config */
import requestSetConfigFromMutation from '../../config/actions/requestSetConfigFromMutation'
import requestDeleteConfigFromMutation from '../../config/actions/requestDeleteConfigFromMutation'
/* jobQueue */
import requestCreateJob from '../../jobQueue/actions/requestCreateJob'
import deleteJob from '../../jobQueue/actions/deleteJob'
/* spool */
import spoolTask from '../../spool/actions/spoolTask'
import spoolJobFile from '../../spool/actions/spoolJobFile'
import spoolMacro from '../../spool/actions/spoolMacro'

const MutationResolvers = {
  Mutation: {
    /* config */
    setConfig: (source, args, { store }) => {
      const {
        action,
        errors,
      } = requestSetConfigFromMutation(source, args, { store })

      if (errors) {
        return { errors }
      }

      store.dispatch(action)
      return {}
    },
    deleteConfig: (source, args, { store }) => {
      const action = requestDeleteConfigFromMutation(source, args, { store })
      if (action == null) {
        return null
      }

      store.dispatch(action)
      return null
    },
    /* jobQueue */
    createJob: actionResolver({
      requirePrinterID: false,
      actionCreator: requestCreateJob,
      // TODO: returning the job will not work until thunks are removed from Tegh
      // selector: (state, action) => state.jobQueue.jobs.get(action.payload.job.id),
      selector: () => null,
    }),
    deleteJob: actionResolver({
      requirePrinterID: false,
      actionCreator: deleteJob,
      selector: () => null,
    }),
    /* spool */
    spoolCommands: actionResolver({
      actionCreator: spoolTask,
      selector: (state, action) => action.payload.task,
    }),
    spoolJobFile: actionResolver({
      actionCreator: spoolJobFile,
      // selector: (state, action) => action.payload.task,
      selector: () => null,
    }),
    spoolMacro: actionResolver({
      actionCreator: spoolMacro,
      selector: () => null,
    }),
  },
}

export default MutationResolvers
