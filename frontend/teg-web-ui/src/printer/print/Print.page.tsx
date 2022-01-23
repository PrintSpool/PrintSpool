import React, { useState } from 'react'
import { useAsyncCallback } from 'react-async-hook';
import { useHistory, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client'
import { useMutation } from '@apollo/client'

import PrintView from './Print.view'
import { usePrintMutation } from '../jobQueue/JobQueue.graphql'

interface PrintFile {
  id: number,
  name: string,
  url: string,
  isMesh: boolean,
  meshVersion: number,
  gcodeVersion: number,
  gcodeBlob: null | Blob,
  gcodeText: null | string,
}

const PrintPage = () => {
  const history = useHistory();
  const { machineID } = useParams();

  const [printFiles, setPrintFiles] = useState(() => (
    JSON.parse(window.sessionStorage.getItem('printFiles')).map((printFile, id) => {
      const isMesh = !(printFile.name.endsWith('.ngc') || printFile.name.endsWith('.gcode'));

      return {
        ...printFile,
        id,
        isMesh,
        meshVersion: 1,
        gcodeVersion: isMesh ? null : 1,
        gcodeBlob: null,
        gcodeText: null,
      } as PrintFile
    })
  ));

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
        printQueues(input: { machineID: $machineID }) {
          id
          name
        }
      }
    `,
    {
      pollInterval: 1000,
      variables: { machineID },
    },
  );

  const [slice, sliceMutation] = useMutation(gql`
    mutation($input: SliceInput!) {
      slice(input: $input)
    }
  `)

  const [ addPartsToPrintQueue, addPartsMutation ] = useMutation(gql`
    mutation addPartsToPrintQueue($input: AddPartsToPrintQueueInput!) {
      addPartsToPrintQueue(input: $input) {
        id
      }
    }
  `);

  const [print, printMutationResult ] = usePrintMutation()

  const submit = useAsyncCallback(async ({ printNow }) => {
    const printFilePromises = printFiles
      .map((printFile: PrintFile) => async (): Promise<PrintFile> => {
        if (
          printFile.gcodeVersion === printFile.meshVersion
          && printFile.gcodeBlob != null
        ) {
          // GCode is up to date and gcodeBlob is loaded
          return printFile
        }

        const res = await fetch(printFile.url);
        const blob = await res.blob();

        if (!printFile.isMesh && printFile.gcodeBlob == null) {
          // GCode blob just hadn't been loaded yet
          return {
            ...printFile,
            gcodeBlob: blob,
          }
        }

        // Otherwise the mesh needs to be sliced
        console.log('Slicing....')
        const { data: { slice: gcodeText } } = await slice({
          variables: {
            input: {
              name: printFile.name,
              file: blob,
            },
          }
        })

        return {
          ...printFile,
          gcodeVersion: printFile.meshVersion,
          gcodeBlob: new Blob([gcodeText]),
          gcodeText,
        }
      });

    // Slice parts sequentially to prevent thrashing via parallel slicing on the Pi
    const nextPrintFiles = await printFilePromises.reduce(
      (a, b) => a.then(async (vals) => [...vals, await b()]),
      Promise.resolve([]),
    );

    // TODO: This will have to become a merge operation once mesh manipulation is supported
    setPrintFiles(nextPrintFiles);

    const parts = nextPrintFiles.map((printFile: PrintFile) => ({
      name: printFile.name,
      file: printFile.gcodeBlob,
    }));

    const MB = 1000 * 1000
    const fileMBs = nextPrintFiles
      .map(printFile => printFile.gcodeBlob.size / MB)
      .reduce((a, b) => a + b)
    const startedAt = Date.now()

    const addPartsToPrintQueueResult = await addPartsToPrintQueue({
      variables: {
        input: {
          // TODO: Multi-print queues: the print queue should be selectable by the user
          printQueueID: data.printQueues[0].id,
          name: nextPrintFiles.map(f => f.name).join(', '),
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

  const isMutationPending = (
    submit.loading
    ?? addPartsMutation.loading
    ?? printMutationResult.loading
    ?? sliceMutation.loading
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
      printQueues: data.printQueues,
      printFile: printFiles[0],
      loading: query.loading,
      isMutationPending,
      addToQueue: () => submit.execute({ printNow: false }),
      printNow: () => submit.execute({ printNow: true }),
      sliceMutation,
      slice: async (printFile: PrintFile) => {
        const res = await fetch(printFile.url);
        const file = await res.blob();

        console.log('Slicing....')
        const { data: { slice: gcodeText } } = await slice({
          variables: {
            input: {
              name: printFile.name,
              file,
            }
          }
        })

        setPrintFiles(printFiles => printFiles.map((p) => {
          if (p.id === printFile.id) {
            return {
              ...p,
              gcodeVersion: printFile.meshVersion,
              gcodeBlob: new Blob([gcodeText]),
              gcodeText,
            }
          } else {
            return p
          }
        }));
      },
    }} />
  )
}

export default PrintPage
