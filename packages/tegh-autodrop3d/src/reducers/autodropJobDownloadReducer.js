import Promise from 'bluebird'
import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  SET_CONFIG,
  JOB_QUEUE_COMPLETE,
  REQUEST_CREATE_JOB,
  DESPOOL_TASK,
  getPluginModels,
  despoolCompleted,
} from '@tegh/core'

import downloadAutodropJob, { DOWNLOAD_AUTODROP_JOB } from '../actions/downloadAutodropJob'
import pollAutodrop, { POLL_AUTODROP } from '../actions/pollAutodrop'
import jobDownloadComplete, { JOB_DOWNLOAD_COMPLETE } from '../actions/jobDownloadComplete'
import jobDownloadFail, { JOB_DOWNLOAD_FAIL } from '../actions/jobDownloadFail'
import { AUTODROP_JOB_DONE } from '../actions/autodropJobDone'

import getAutodropURL from '../selectors/getAutodropURL'

import fetchFromAutodrop from '../sideEffects/fetchFromAutodrop'

export const initialState = Record({
  // configs
  config: null,
  // dynamic state
  pollingInitialized: false,
  queueIsEmpty: true,
  downloadingJob: false,
  autodropJobInProgress: false,
  blocking: false,
})()

/*
 * Attempts to download a job from Autodrop and if any are found it adds it to
 * the print queue. Blocks until a response is received or the request times
 * out.
 *
 * Example useage:
 *   fetchAutodropJob
 *   spoolAutodropJob
 */
const FETCH_AUTODROP_MACRO = 'fetchAutodropJob'

const PACKAGE = '@tegh/autodrop3d'
const POLLING_INTERVAL = 500

const runPollAfterInterval = () => (
  Cmd.run(Promise.delay, {
    args: [POLLING_INTERVAL],
    successActionCreator: pollAutodrop,
  })
)

const autodropReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const autodropConfig = getPluginModels(config).get(PACKAGE).toJS()

      const nextState = initialState.merge({
        config: autodropConfig,
        pollingInitialized: true,
      })

      if (state.pollingInitialized === false) {
        return loop(
          nextState,
          Cmd.action(pollAutodrop()),
        )
      }

      return nextState
    }
    case DESPOOL_TASK: {
      const { macro } = action.payload

      if (macro === FETCH_AUTODROP_MACRO) {
        const {
          downloadingJob,
          autodropJobInProgress,
        } = state

        if (
          autodropJobInProgress === true
          || downloadingJob === true
        ) {
          throw new Error(
            'Cannot download more then one autodrop job at a time',
          )
        }

        const nextState = state
          .set('downloadingJob', true)
          .set('blocking', true)

        return loop(
          nextState,
          Cmd.action(downloadAutodropJob()),
        )
      }

      return state
    }
    case POLL_AUTODROP: {
      const {
        config,
        queueIsEmpty,
        downloadingJob,
        autodropJobInProgress,
      } = state

      /*
       * if we are downloading a job presently then do not poll again. Once the
       * download succeeds or fails it will resume polling for us.
       */
      if (downloadingJob) {
        return state
      }

      /*
       * do not download any jobs from AutoDrop until the queue is empty
       * or when automaticJobDownloads are turned off.
       */
      if (
        config.automaticJobDownload === false
        || queueIsEmpty === false
        || autodropJobInProgress === true
      ) {
        return loop(
          state,
          runPollAfterInterval(),
        )
      }

      const nextState = state.set('downloadingJob', true)

      return loop(
        nextState,
        Cmd.action(downloadAutodropJob()),
      )
    }
    case DOWNLOAD_AUTODROP_JOB: {
      const { config } = state
      const url = getAutodropURL({ config })

      return loop(
        state,
        Cmd.run(
          fetchFromAutodrop,
          {
            args: [{ url }],
            successActionCreator: jobDownloadComplete,
            failActionCreator: jobDownloadFail,
          },
        ),
      )
    }
    case JOB_DOWNLOAD_FAIL:
    case JOB_DOWNLOAD_COMPLETE: {
      let nextState = state.set('downloadingJob', false)

      const cmds = [
        runPollAfterInterval(),
      ]

      if (state.blocking) {
        nextState = nextState.set('blocking', false)
        cmds.push(
          Cmd.action(despoolCompleted()),
        )
      }

      return loop(
        nextState,
        Cmd.list(cmds),
      )
    }
    case JOB_QUEUE_COMPLETE: {
      const nextState = state.set('queueIsEmpty', true)

      // trigger an immediate request to autodrop to see if there are new jobs
      return loop(
        nextState,
        Cmd.action(pollAutodrop()),
      )
    }
    case REQUEST_CREATE_JOB: {
      if (action.payload.job.meta.autodropJobID != null) {
        return state.set('autodropJobInProgress', true)
      }

      return state
    }
    case AUTODROP_JOB_DONE: {
      const nextState = state.set('autodropJobInProgress', false)

      // trigger an immediate request to autodrop to see if there are new jobs
      return loop(
        nextState,
        Cmd.action(pollAutodrop()),
      )
    }
    default: {
      return state
    }
  }
}

export default autodropReducer
