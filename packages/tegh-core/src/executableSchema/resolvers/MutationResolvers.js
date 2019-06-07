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
import { NORMAL, EMERGENCY } from '../../spool/types/PriorityEnum'

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
    createJob: (source, args, { store }) => {
      const action = requestCreateJob(args.input)

      store.dispatch(action)

      return action.payload.job
    },
    deleteJob: actionResolver({
      requirePrinterID: false,
      actionCreator: deleteJob,
      selector: () => null,
    }),
    /* spool */
    execGCodes: async (source, args, { store }) => {
      const { gcodes } = args.input

      const completedTask = await new Promise((resolve, reject) => {
        const action = spoolTask({
          name: '[spoolGCodes]',
          data: [
            ...gcodes,
            /*
             * the noOp executes after any macro expansions. This allows us
             * to synchronize the end of the task/mutation with the end of a
             * host macro if the host macro is the line line of gcode.
            */
            'noOp',
          ],
          priority: gcodes.every(line => line === 'reset') ? EMERGENCY : NORMAL,
          internal: false,
          onComplete: resolve,
          onError: reject,
        })

        store.dispatch(action)
      })

      return completedTask
    },
    // TODO: the job file returned by spoolJobFile won't have been spooled yet.
    // A promise should be used to await the job file actually being spooled
    // before retuning from the mutation.
    spoolJobFile: actionResolver({
      actionCreator: requestSpoolJobFile,
      selector: (state, action) => (
        state.jobQueue.jobFiles.get(action.payload.jobFileID)
      ),
    }),
  },
}

export default MutationResolvers
