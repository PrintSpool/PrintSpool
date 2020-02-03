import actionResolver from '../../util/actionResolver'

/* auth */
import consumeInvite from '../../auth/sideEffects/consumeInvite'
import removeUser from '../../auth/sideEffects/removeUser'
/* config */
import requestCreateConfigFromMutation from '../../config/actions/requestCreateConfigFromMutation'
import requestUpdateConfigFromMutation from '../../config/actions/requestUpdateConfigFromMutation'
import requestDeleteConfigFromMutation from '../../config/actions/requestDeleteConfigFromMutation'
/* jobQueue */
import requestCreateJob from '../../jobQueue/actions/requestCreateJob'
import deleteJob from '../../jobQueue/actions/deleteJob'
/* spool */
import execGCodes from '../../jobQueue/actions/execGCodes'
import requestSpoolJobFile from '../../jobQueue/actions/requestSpoolJobFile'
/* machine */
import requestEStop from '../../printer/actions/requestEStop'
import requestReset from '../../printer/actions/requestReset'

const MutationResolvers = {
  Mutation: {
    /* auth */
    consumeInvite: (source, args, context) => consumeInvite(context),
    removeUser: (source, args, context) => removeUser(args, context),
    removeCurrentUser: (source, args, context) => {
      removeUser({ userID: context.user.id.toString() }, context)
    },
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
          machineID: state.config.printer.id,
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
      const { macros, config } = store.getState()
      const action = requestCreateJob({
        ...args.input,
        macros,
        combinatorConfig: config,
        // TODO: multimachine: need to add a machineID arg to the mutation
        machineConfig: config.printer,
      })

      store.dispatch(action)

      return action.payload.job
    },
    deleteJob: actionResolver({
      actionCreator: deleteJob,
      requireMachineID: false,
      selector: () => null,
    }),
    /* spool */
    execGCodes: async (source, args, { store }) => {
      const { macros, config } = store.getState()
      const { gcodes: commands, machineID } = args.input

      const completedTask = await new Promise((resolve, reject) => {
        const action = execGCodes({
          machineID,
          commands,
          macros,
          combinatorConfig: config,
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

    eStop: (source, { machineID }, { store }) => {
      const state = store.getState()

      if (state.config.machines.get(machineID) == null) {
        throw new Error(`machine ID ${machineID} does not exist`)
      }

      store.dispatch(requestEStop({ machineID }))

      return null
    },
    reset: (source, { machineID }, { store }) => {
      const state = store.getState()

      if (state.config.machines.get(machineID) == null) {
        throw new Error(`machine ID ${machineID} does not exist`)
      }

      store.dispatch(requestReset({ machineID }))

      return null
    },
  },
}

export default MutationResolvers
