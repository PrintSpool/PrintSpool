import actionResolver from '../../util/actionResolver'

/* config */
import requestSetConfigFromMutation from '../../config/actions/requestSetConfigFromMutation'
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
      const action = requestSetConfigFromMutation(source, args, { store })
      store.dispatch(action)

      return {}
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
