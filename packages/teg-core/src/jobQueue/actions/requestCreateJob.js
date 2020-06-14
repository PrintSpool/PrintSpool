import Job from '../types/Job'
import AnnotatedGCodes from '../types/AnnotatedGCodes'
import getPluginModels from '../../config/selectors/getPluginModels'

export const REQUEST_CREATE_JOB = 'teg/jobQueue/REQUEST_CREATE_JOB'

const requestCreateJob = ({
  files,
  name,
  meta = {},
  macros,
  combinatorConfig,
  machineConfig,
  onCreate = () => {},
}) => {
  if (name == null) {
    throw new Error('name cannot be null')
  }

  if (files == null || files.length === 0) {
    throw new Error('requires at least one file')
  }

  const {
    beforePrintHook,
    afterPrintHook,
  } = getPluginModels(machineConfig).get('@tegapp/core').toJS()

  const job = Job({ name, meta })

  return {
    type: REQUEST_CREATE_JOB,
    payload: {
      onCreate,
      job,
      files: files.map((file) => {
        const { annotations, commands } = AnnotatedGCodes({
          commands: [
            beforePrintHook,
            file.content,
            afterPrintHook,
          ],
          macros,
          combinatorConfig,
          machineConfig,
        })

        return {
          name: file.name,
          annotations,
          commands,
        }
      }),
    },
  }
}

export default requestCreateJob
