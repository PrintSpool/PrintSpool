import actionResolver from '../../util/actionResolver'

/* config */
import requestCreateConfigFromMutation from '../../config/actions/requestCreateConfigFromMutation'
import requestUpdateConfigFromMutation from '../../config/actions/requestUpdateConfigFromMutation'
import requestDeleteConfigFromMutation from '../../config/actions/requestDeleteConfigFromMutation'
/* jobQueue */
import requestCreateJob from '../../jobQueue/actions/requestCreateJob'
import deleteJob from '../../jobQueue/actions/deleteJob'
/* spool */
import spoolTask from '../../spool/actions/spoolTask'
import requestSpoolJobFile from '../../spool/actions/requestSpoolJobFile'
import spoolMacro from '../../spool/actions/spoolMacro'
import { NORMAL } from '../../spool/types/PriorityEnum'

const MutationResolvers = {
  Mutation: {
    /* config */
    createConfig: (source, args, { store }) => {
      const {
        action,
        errors,
      } = requestCreateConfigFromMutation(source, args, { store })

      if (errors) {
        return { errors }
      }

      store.dispatch(action)
      return {}
    },
    updateConfig: (source, args, { store }) => {
      const {
        action,
        errors,
      } = requestUpdateConfigFromMutation(source, args, { store })

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
    createMachine: (source, args, { store }) => {
      const state = store.getState()

      const updateArgs = {
        input: {
          printerID: state.config.printer.id,
          collection: 'MACHINE',
          modelVersion: state.config.printer.modelVersion,
          model: args.input.model,
        },
      }

      const {
        action,
        errors,
      } = requestUpdateConfigFromMutation(source, updateArgs, { store })

      if (errors) {
        return { errors }
      }

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
    spoolGCodes: actionResolver({
      actionCreator: ({ gcodes }) => spoolTask({
        name: '[spoolGCodes]',
        data: gcodes,
        priority: NORMAL,
        internal: false,
      }),
      selector: () => null,
    }),
    spoolJobFile: actionResolver({
      actionCreator: requestSpoolJobFile,
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
