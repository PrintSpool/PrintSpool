import actionResolver from '../../util/actionResolver'

/* auth */
// import consumeInvite from '../../auth/sideEffects/consumeInvite'

import updateUser from '../../auth/sideEffects/updateUser'
// import deleteUser from '../../auth/sideEffects/deleteUser'

import createInvite from '../../auth/sideEffects/createInvite'
import updateInvite from '../../auth/sideEffects/updateInvite'
// import deleteInvite from '../../auth/sideEffects/deleteInvite'

// import createVideoSDP from '../../auth/sideEffects/createVideoSDP'

/* config */
import requestCreateConfigFromMutation from '../../config/actions/requestCreateConfigFromMutation'
import requestUpdateConfigFromMutation from '../../config/actions/requestUpdateConfigFromMutation'
import requestDeleteConfigFromMutation from '../../config/actions/requestDeleteConfigFromMutation'
import setToolheadMaterials from '../../config/actions/setToolheadMaterials'
/* jobQueue */
import requestCreateJob from '../../jobQueue/actions/requestCreateJob'
import setJobPosition from '../../jobQueue/actions/setJobPosition'
import deleteJob from '../../jobQueue/actions/deleteJob'
/* spool */
import execGCodes from '../../jobQueue/actions/execGCodes'
import requestSpoolJobFile from '../../jobQueue/actions/requestSpoolJobFile'
/* machine */
import requestEStop from '../../printer/actions/requestEStop'
import requestReset from '../../printer/actions/requestReset'
import { READY } from '../../printer/types/statusEnum'

const MutationResolvers = {
  Mutation: {
    // Auth has been moved to Rust
    // /* auth */
    createInvite: (source, args, context) => createInvite(args, context),
    updateInvite: (source, args, context) => updateInvite(args, context),
    // deleteInvite: (source, args, context) => deleteInvite(args, context),

    // // consumeInvite: (source, args, context) => consumeInvite(context),

    updateUser: (source, args, context) => updateUser(args, context),
    // deleteUser: (source, args, context) => deleteUser(args, context),
    // deleteCurrentUser: (source, args, context) => {
    //   const input = { userID: context.user.id.toString() }
    //   return deleteUser({ input }, context)
    // },

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
    setMaterials: (source, args, { store }) => {
      const {
        machineID,
        toolheads,
      } = args.input

      const { sockets } = store.getState()
      const { status } = sockets.machines.get(machineID)
      if (status !== READY) {
        throw new Error(`Cannot set materials while printer is ${status}`)
      }

      const changes = {}
      toolheads.forEach(({ id, materialID }) => {
        changes[id] = materialID
      })

      const action = setToolheadMaterials({
        machineID,
        changes,
      })

      store.dispatch(action)
      return {}
    },
    /* jobQueue */
    createJob: async (source, args, { store }) => {
      const { macros, config } = store.getState()
      const job = await new Promise((onCreate) => {
        const action = requestCreateJob({
          ...args.input,
          onCreate,
          macros,
          combinatorConfig: config,
          // TODO: multimachine: need to add a machineID arg to the mutation
          machineConfig: config.printer,
        })

        store.dispatch(action)
      })

      return job
    },
    setJobPosition: actionResolver({
      actionCreator: setJobPosition,
      requireMachineID: false,
      selector: () => null,
    }),
    deleteJob: actionResolver({
      actionCreator: deleteJob,
      requireMachineID: false,
      selector: () => null,
    }),
    /* spool */
    execGCodes: async (source, args, { store }) => {
      const { macros, config, sockets } = store.getState()
      const {
        gcodes: commands,
        machineID,
        sync = false,
        override = false,
      } = args.input

      const { status } = sockets.machines.get(machineID)
      if (status !== READY) {
        throw new Error(`Cannot send gcodes while printer is ${status}`)
      }

      if (override && sync) {
        throw new Error('Override GCodes will not block. Cannot be used with sync = true.')
      }

      const task = await new Promise((resolve, reject) => {
        const action = execGCodes({
          machineID,
          commands,
          macros,
          combinatorConfig: config,
          macineOverride: override,
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
