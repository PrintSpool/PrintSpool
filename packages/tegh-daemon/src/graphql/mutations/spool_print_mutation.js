import path from 'path'
import {default as _fs} from 'fs'
import Promise from 'bluebird'
import tql from 'typiql'
import untildify from 'untildify'
import {
  GraphQLInputObjectType
} from 'graphql'

import TaskType from '../types/task_type'
import spoolAction from '../../actions/spool_action.js'

const fs = Promise.promisifyAll(_fs)

const PrintFileInputType = new GraphQLInputObjectType({
  name: 'PrintFile',
  fields: {
    localPath: {
      type: tql`String`,
    },
    /*
     * TODO: either allow a local file path or the content and fileName
     * of a file upload.
     */
    // fileName: tql`String`,
    // content: tql`String`,
  }
})

const spoolPrintMutation = () => ({
  type: tql`${TaskType}!`,
  args: {
    printerID: {
      type: tql`ID!`,
    },
    file: {
      type: tql`${PrintFileInputType}!`,
    },
    startImmediately: {
      type: tql`Boolean`,
      defaultValue: false,
    },
  },
  resolve: async (_source, args, { store }) => {
    const state = store.getState()
    const { config } = state
    if (args.printerID !== config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    if (config.printFromLocalPath.enabled === false) {
      throw new Error(`printing from localPaths is disabled`)
    }
    if (args.file.localPath == null) {
      throw new Error(`localPath cannot be null`)
    }
    const localPath = path.normalize(untildify(args.file.localPath))
    if (!(localPath.endsWith('.gcode') || localPath.endsWith('.ngc'))) {
      throw new Error(
        `file extension not supported. Must be either .gcode or .ngc`
      )
    }
    const whitelisted = (() => {
      for (const validPath of config.printFromLocalPath.whitelist) {
        const normalizedValidPath = path.normalize(untildify(validPath))
        if (localPath.startsWith(normalizedValidPath)) return true
      }
      return false
    })
    if (!whitelisted) {
      throw new Error(
        `localPath is not in a whitelisted directory`
      )
    }
    if (!args.startImmediately) {
      throw new Error(
        `Only startImmediately: true is supported currently`
      )
    }

    const gcode = (await fs.readFileAsync(localPath)).toString()
    const action = spoolAction({
      spoolName: 'printQueue',
      fileName: path.basename(localPath),
      data: [gcode],
    })
    store.dispatch(action)
    return action.task
  },
})

export default spoolPrintMutation
