import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SET_CONFIG,
  DESPOOL_TASK,
  getPluginModels,
  requestCreateJob,
  getTaskPercentComplete,
} from '@tegh/core'

import markAutodropJobAsDone, { MARK_AUTODROP_JOB_AS_DONE } from '../actions/markAutodropJobAsDone'
import { JOB_DOWNLOAD_COMPLETE } from '../actions/jobDownloadComplete'
import autodropJobDone, { AUTODROP_JOB_DONE } from '../actions/autodropJobDone'
import autodropJobDoneFail, { AUTODROP_JOB_DONE_FAIL } from '../actions/autodropJobDoneFail'
import autodropUpdateFail from '../actions/autodropUpdateFail'

import getAutodropURL from '../selectors/getAutodropURL'

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

export const initialState = Record({
  // configs
  config: null,
  // dynamic state
  lastUpdate: 0,
  autodropJobID: null,
  teghJobID: null,
})()

const PACKAGE = '@tegh/autodrop3d'
const UPDATE_INTERVAL = 500
const RETRY_DELAY_AFTER_ERROR = 500

const autodropReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const autodropConfig = getPluginModels(config).get(PACKAGE).toJS()

      const nextState = initialState.merge({
        config: autodropConfig,
      })

      return nextState
    }
    case JOB_DOWNLOAD_COMPLETE: {
      const content = action.payload
      const lines = content.split('\n')

      const autodropIsEmpty = lines[0].indexOf(';START') === -1

      if (autodropIsEmpty) {
        return state
      }

      const autodropJobID = lines[2].replace(';', '').trim()

      const name = `AUTODROP JOB #${autodropJobID}`

      const nextAction = requestCreateJob({
        name,
        meta: { autodropJobID },
        files: [{
          name,
          content,
        }],
      })

      const nextState = state.merge({
        teghJobID: nextAction.payload.job.id,
        autodropJobID,
      })

      return loop(
        nextState,
        Cmd.action(nextAction),
      )
    }
    case DESPOOL_TASK: {
      const {
        config,
        lastUpdate,
        autodropJobID,
        teghJobID,
      } = state

      const {
        task,
        isLastLineInTask,
      } = action.payload

      if (task.jobID == null || task.jobID !== teghJobID) {
        return state
      }

      if (isLastLineInTask) {
        return loop(state, Cmd.action(markAutodropJobAsDone()))
      }

      if (Date.now() > lastUpdate + UPDATE_INTERVAL) {
        const percentComplete = getTaskPercentComplete({
          task,
          despooling: true,
        })

        const url = getAutodropURL({
          config,
          params: {
            jobID: autodropJobID,
            stat: 'update',
            jobStatus: percentComplete,
          },
        })

        return loop(
          state,
          Cmd.run(
            fetchFromAutodrop,
            {
              args: [{ url }],
              failActionCreator: autodropUpdateFail,
            },
          ),
        )
      }

      return state
    }
    case MARK_AUTODROP_JOB_AS_DONE: {
      const {
        config,
        autodropJobID,
      } = state

      if (autodropJobID == null) {
        throw new Error('AutoDrop Job ID cannot be Null')
      }

      const url = getAutodropURL({
        config,
        params: {
          jobID: autodropJobID,
          stat: 'Done',
        },
      })

      return loop(
        state,
        Cmd.run(
          fetchFromAutodrop,
          {
            args: [{ url }],
            successActionCreator: autodropJobDone,
            failActionCreator: autodropJobDoneFail,
          },
        ),
      )
    }
    case AUTODROP_JOB_DONE: {
      return state.merge({
        autodropJobID: null,
        teghJobID: null,
      })
    }
    case AUTODROP_JOB_DONE_FAIL: {
      return loop(
        state,
        Cmd.run(Promise.delay, {
          args: [RETRY_DELAY_AFTER_ERROR],
          successActionCreator: markAutodropJobAsDone,
        }),
      )
    }
    default: {
      return state
    }
  }
}

export default autodropReducer
