import actionResolver from '../../util/actionResolver'

/* auth */
// import consumeInvite from '../../auth/sideEffects/consumeInvite'

import updateUser from '../../auth/sideEffects/updateUser'
import deleteUser from '../../auth/sideEffects/deleteUser'

import createInvite from '../../auth/sideEffects/createInvite'
import updateInvite from '../../auth/sideEffects/updateInvite'
import deleteInvite from '../../auth/sideEffects/deleteInvite'

// import createVideoSDP from '../../auth/sideEffects/createVideoSDP'

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
    createInvite: (source, args, context) => createInvite(args, context),
    updateInvite: (source, args, context) => updateInvite(args, context),
    deleteInvite: (source, args, context) => deleteInvite(args, context),

    // consumeInvite: (source, args, context) => consumeInvite(context),

    updateUser: (source, args, context) => updateUser(args, context),
    deleteUser: (source, args, context) => deleteUser(args, context),
    deleteCurrentUser: (source, args, context) => {
      const input = { userID: context.user.id.toString() }
      return deleteUser({ input }, context)
    },

    // createVideoSDP,

    /* config */
    createConfig: (source, args, context) => {
      // const {
      //   collection,
      //   schemaFormKey,
      //   model,
      // } = args.input

      const { store } = context

      // if (collection === 'AUTH') {
      //   if (schemaFormKey === 'invite') {
      //     return createInvite(model, context)
      //   }
      //   throw new Error(`Invalid AUTH shemaFormKey: ${schemaFormKey}`)
      // }

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
    updateConfig: (source, args, context) => {
      // const {
      //   collection,
      //   schemaFormKey,
      //   model,
      //   configFormID,
      // } = args.input

      const { store } = context

      // if (collection === 'AUTH') {
      //   if (schemaFormKey === 'user') {
      //     return updateUser(configFormID, model, context)
      //   }
      //   if (schemaFormKey === 'invite') {
      //     return updateInvite(configFormID, model, context)
      //   }
      //   throw new Error(`Invalid AUTH shemaFormKey: ${schemaFormKey}`)
      // }

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
    deleteConfig: (source, args, context) => {
      const {
        collection,
        schemaFormKey,
        model,
      } = args.input

      const { store } = context

      if (collection === 'AUTH') {
        if (schemaFormKey === 'user') {
          return deleteUser(model, context)
        }
        if (schemaFormKey === 'invite') {
          return deleteInvite(model, context)
        }
        throw new Error(`Invalid AUTH shemaFormKey: ${schemaFormKey}`)
      }

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
      const {
        gcodes: commands,
        machineID,
        sync = false,
      } = args.input

      const task = await new Promise((resolve, reject) => {
        const action = execGCodes({
          machineID,
          commands,
          macros,
          combinatorConfig: config,
          onComplete: sync ? resolve : null,
          onError: sync ? reject : null,
        })

        store.dispatch(action)

        if (!sync) {
          resolve(action.payload.task)
        }
      })

      return task
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
