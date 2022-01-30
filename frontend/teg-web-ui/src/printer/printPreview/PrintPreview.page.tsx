import React, { useState } from 'react'
import { useAsyncCallback } from 'react-async-hook';
import { useHistory, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client'
import { useMutation } from '@apollo/client'

import PrintView from './PrintPreview.view'
import { usePrintMutation } from '../jobQueue/JobQueue.graphql'

interface Vec3 {
  x: number
  y: number
  z: number
}

interface PrintFile {
  id: number
  name: string
  url: string
  isMesh: boolean
  meshVersion: number
  gcodeVersion: number
  gcodeBlob: null | Blob
  gcodeText: null | string
  quantity: number
  rotationMat3: { x: Vec3, y: Vec3, z: Vec3 }
  position: Vec3
  positionWithOffset: Vec3
  scale: Vec3
}

const PrintPage = () => {
  const history = useHistory();
  const { machineID } = useParams();

  const [printFiles, setPrintFiles] = useState(() => (
    JSON.parse(window.sessionStorage.getItem('printFiles')).map((printFile, id): PrintFile => {
      const isMesh = !(printFile.name.endsWith('.ngc') || printFile.name.endsWith('.gcode'));

      return {
        ...printFile,
        id,
        isMesh,
        meshVersion: 1,
        gcodeVersion: isMesh ? null : 1,
        gcodeBlob: null,
        gcodeText: null,
        quantity: 1,
        rotationMat3: {
          x: { x: 1, y: 0, z: 0 },
          y: { x: 0, y: 1, z: 0 },
          z: { x: 0, y: 0, z: 1 },
        },
        position: { x: 0, y: 0, z: 0 },
        positionWithOffset: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      }
    })
  ));

  const [printFileIndex, setPrintFileIndex] = useState(0)

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

  const slicePrintFile = async ({
    printFile,
    blob,
  }: {
    printFile: PrintFile,
    blob: Blob,
  }) => {
    console.log('Slicing...')

    const {
      name,
      rotationMat3: r,
      positionWithOffset,
      scale,
    } = printFile;
    console.log({ printFile })

    const { data: { slice: gcodeText } } = await slice({
      variables: {
        input: {
          name,
          rotationMat3: [r.x, r.y, r.z],
          position: positionWithOffset,
          scale,
          file: blob,
        }
      }
    })

    console.log(`Slicing... [DONE] (${(gcodeText.length / 1_000_000).toFixed(2)}MB)`)

    return {
      gcodeVersion: printFile.meshVersion,
      gcodeBlob: new Blob([gcodeText]),
      gcodeText,
    };
  }

  const [ addPartsToPrintQueue, addPartsMutation ] = useMutation(gql`
    mutation addPartsToPrintQueue($input: AddPartsToPrintQueueInput!) {
      addPartsToPrintQueue(input: $input) {
        id
        parts {
          id
        }
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
        return {
          ...printFile,
          ...await slicePrintFile({ printFile, blob })
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
      quantity: printFile.quantity,
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

    console.log({ addPartsToPrintQueueResult })

    const totalSeconds = (Date.now() - startedAt) / 1000
    console.log(
      'Upload Complete: '
      + `${fileMBs.toFixed(1)}MB uploaded in ${totalSeconds.toFixed(1)}s `
      // + `(read time: ${readSeconds.toFixed(2)}s) = `
      + `${(fileMBs / totalSeconds).toFixed(1)} MB/s`
    )

    if (printNow) {
      await print({
        variables: {
          input: {
            machineID: machineID,
            partID: addPartsToPrintQueueResult.data.addPartsToPrintQueue.parts[0].id,
          },
        },
      })
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
    || addPartsMutation.loading
    || printMutationResult.loading
    || sliceMutation.loading
  );

  if (error) {
    throw error
  }

  if (query.loading) {
    return <div/>
  }

  const currentPrintFile = printFiles[printFileIndex];

  const updatePrintFileAttrs = (attrs) => setPrintFiles(printFiles => printFiles.map(p => {
    if (p.id === currentPrintFile.id) {
      return {
        ...p,
        ...attrs,
      }
    } else {
      return p
    }
  }))

  return (
    <PrintView {...{
      machine: data?.machines[0],
      printQueues: data.printQueues,
      printFiles,
      printFile: currentPrintFile,
      loading: query.loading,
      isMutationPending,
      isUploading: submit.loading,
      setPrintFileIndex,
      onEvent: (event) => {
        if (event.type === 'transform') {
          const {
            source,
            ...attrs
          } = event;

          // Update the print file and invalidate the GCode when the user modifies the model transform
          updatePrintFileAttrs({
            ...attrs,
            gcodeVersion: null,
            gcodeBlob: null,
            gcodeText: null,
          })

          setPrintFiles(printFiles => printFiles.map(p => (
            p.id === currentPrintFile.id ? { ...p, ...attrs } : p
          )))
          console.log('transform!', event);
        }
      },
      setQuantity: (quantity) => {
        updatePrintFileAttrs({ quantity })
      },
      addToQueue: () => submit.execute({ printNow: false }),
      printNow: () => submit.execute({ printNow: true }),
      sliceMutation,
      slice: async () => {
        const res = await fetch(currentPrintFile.url);
        const blob = await res.blob();

        const attrs = await slicePrintFile({ printFile: currentPrintFile, blob })

        updatePrintFileAttrs(attrs)
      },
    }} />
  )
}

export default PrintPage
