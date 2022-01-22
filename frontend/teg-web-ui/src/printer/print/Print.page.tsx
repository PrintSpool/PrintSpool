import React, { useCallback, useMemo, useState } from 'react'
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { useHistory, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client'
import { useMutation } from '@apollo/client'

import PrintView from './Print.view'
import { usePrintMutation } from '../jobQueue/JobQueue.graphql'
import useLiveSubscription from '../_hooks/useLiveSubscription';

const PrintPage = () => {
  const history = useHistory();
  const { machineID, printQueueID } = useParams();

  const [userInputFiles] = useState(() => (
    JSON.parse(window.sessionStorage.getItem('printFiles'))
  ));

  const [loading, setLoading] = useState(true)
  const [gcodeText, setGCodeText] = useState()

  const { data, ...query } = useQuery(
    gql`
      query($machineID: ID) {
        machines(input: { machineID: $machineID }) {
          id
          name
          status
          infiniteZ
        }
      }
    `,
    {
      pollInterval: 1000,
      variables: { machineID },
    },
  );

  const [sendSliceMutation, sliceMutation] = useMutation(gql`
    mutation($input: SliceInput!) {
      slice(input: $input)
    }
  `)

  const slice = (input) => {
      console.log('Slicing....')
      sendSliceMutation({
        variables: {
          input,
        }
      })
  }

  const [ addPartsToPrintQueue, addPartsMutation ] = useMutation(gql`
    mutation addPartsToPrintQueue($input: AddPartsToPrintQueueInput!) {
      addPartsToPrintQueue(input: $input) {
        id
      }
    }
  `);

  const [print, printMutationResult ] = usePrintMutation()

  const submit = useAsyncCallback(async ([{ printNow }]) => {
    const partPromises = userInputFiles
      .filter(file => file.isGCode)
      .map(async (file) => {
        const res = await fetch(file.url);

        return {
          name: file.name,
          file: res.blob(),
        }
      });

    let parts = await Promise.all(partPromises)

    if (gcodeText != null) {
      parts.push({
        file: new Blob([gcodeText]),
        name: `${userInputFiles[0].name}.gcode`,
      });
    }

    const MB = 1000 * 1000
    const fileMBs = parts[0].file.size / MB
    const startedAt = Date.now()

    const addPartsToPrintQueueResult = await addPartsToPrintQueue({
      variables: {
        input: {
          printQueueID,
          name: userInputFiles.map(f => f.name).join(', '),
          parts,
        },
      },
    })

    if (addPartsToPrintQueueResult.errors != null) {
      throw new Error(addPartsToPrintQueueResult.errors[0].message)
    }

    const totalSeconds = (Date.now() - startedAt) / 1000
    console.log(
      'Upload Complete: '
      + `${fileMBs.toFixed(1)}MB uploaded in ${totalSeconds.toFixed(1)}s `
      // + `(read time: ${readSeconds.toFixed(2)}s) = `
      + `${(fileMBs / totalSeconds).toFixed(1)} MB/s`
    )

    if (printNow) {
      const printResults = await print({
        variables: {
          input: {
            machineID: machineID,
            partID: addPartsToPrintQueueResult.data.addPartsToPrintQueue.parts[0].id,
          },
        },
      })

      if (printResults.errors != null) {
        throw new Error(printResults.errors[0].message)
      }
    }

    history.push('../');
  });

  const error = (
    query.error
    ?? submit.error
    ?? addPartsMutation.error
    ?? printMutationResult.error
    ?? sliceMutation.error
  );

  if (error) {
    throw error
  }

  if (query.loading) {
    return <div/>
  }

  return (
    <PrintView {...{
      machine: data?.machines[0],
      userInputFile: userInputFiles[0],
      loading,
      isMutationPending: submit.loading,
      setLoading,
      setGCodeText,
      addToQueue: () => submit.execute({ printNow: false }),
      printNow: () => submit.execute({ printNow: true }),
      slice,
      sliceMutation,
    }} />
  )
}

export default PrintPage
