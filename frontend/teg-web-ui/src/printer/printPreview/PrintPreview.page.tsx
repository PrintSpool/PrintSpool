import React, { useEffect, useRef, useState } from 'react'
import { useAsyncCallback } from 'react-async-hook';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { exportSTL } from 'slicer-render';

import PrintPreview from './PrintPreview.view'
import { usePrintMutation } from '../jobQueue/JobQueue.graphql'
import PrintViewerCore, { PrintFile, Vec3 } from './PrintViewerCore.view';

const isMeshFileExt = (name) => !(name.endsWith('.ngc') || name.endsWith('.gcode'));

const PrintPage = () => {
  const history = useHistory();
  const { hostID, machineID } = useParams();

  const [printFiles, setPrintFiles] = useState(() => (
    JSON.parse(window.sessionStorage.getItem('printFiles')).map((printFile, id): PrintFile => {
      const isMesh = isMeshFileExt(printFile.name);

      return {
        ...printFile,
        id: `${id}-${printFile.name.replace(/[^a-zA-Z0-9]+/g, '-')}`,
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

  const addFiles = (files) => {
    const addedPrintFiles = files.map((file, i) => {
      console.log(file)
      const isMesh = isMeshFileExt(file.name);

      const printFile: PrintFile = {
        id: `${printFiles.length + i}-${file.name.replace(/[^a-zA-Z0-9]+/g, '-')}`,
        name: file.name,
        url: URL.createObjectURL(file),
        isMesh,
        meshVersion: 1,
        gcodeVersion: isMesh ? null : 1,
        gcodeBlob: null,
        gcodeText: null,
        quantity: 1,
        mat4: {
          x: { x: 1, y: 0, z: 0, w: 0 },
          y: { x: 0, y: 1, z: 0, w: 0 },
          z: { x: 0, y: 0, z: 1, w: 0 },
          w: { x: 0, y: 0, z: 0, w: 1 },
        },
        rotationMat3: {
          x: { x: 1, y: 0, z: 0 },
          y: { x: 0, y: 1, z: 0 },
          z: { x: 0, y: 0, z: 1 },
        },
        position: { x: 0, y: 0, z: 0 },
        positionWithOffset: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      }

      return printFile
    })

    setPrintFiles([
      ...printFiles,
      ...addedPrintFiles,
    ])
  }

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
        slicerEngines {
          id
          name
          transformMat4
          allowsPositioning
          invertRotation { x, y, z }
        }
        printQueues(input: { machineID: $machineID }) {
          id
          name
        }
        featureFlags(input: { filter: ["slicer"] })
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

  const slicerEngineID = data?.machines[0].infiniteZ ? 'beltEngine' : 'curaEngine'
  const slicerEngine = data?.slicerEngines.find(engine => engine.id === slicerEngineID);

  const slicePrintFile = useAsyncCallback(async ({
    printFile,
    blob,
  }: {
    printFile: PrintFile,
    blob: Blob,
  }) => {
    console.log('Exporting STL...')
    const {
      name,
      // rotationMat3: r,
      // positionWithOffset,
      // scale,
      mat4,
    } = printFile;
    console.log({ printFile })

    const modelArrayBuffer = await blob.arrayBuffer();
    const originalU8Array = new Uint8Array(modelArrayBuffer.slice(0));
    const transformedU8Array = await exportSTL(originalU8Array, {
      slicerEngineTransform: slicerEngine.transformMat4,
      modelTransform: mat4,
    });
    console.log(transformedU8Array)
    const transformedArrayBuffer = transformedU8Array.buffer.slice(
      transformedU8Array.byteOffset,
      transformedU8Array.byteLength + transformedU8Array.byteOffset,
    );

    console.log(`Exporting STL... [DONE] (${(transformedU8Array.length / 1_000_000).toFixed(2)}MB)`)
    console.log('Slicing...')

    const { data: { slice: gcodeText } } = await slice({
      variables: {
        input: {
          name,
          // rotationMat3: [r.x, r.y, r.z],
          // position: positionWithOffset,
          // scale,
          rotationMat3: [
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 0, z: 1 },
          ],
          position: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          file: new Blob([transformedArrayBuffer]),
          slicerEngineID,
        }
      }
    })

    console.log(`Slicing... [DONE] (${(gcodeText.length / 1_000_000).toFixed(2)}MB)`)

    const attrs = {
      gcodeVersion: printFile.meshVersion,
      gcodeBlob: new Blob([gcodeText]),
      gcodeText,
    };

    updatePrintFileAttrs(attrs)

    return attrs;
  })

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
          ...await slicePrintFile.execute({ printFile, blob })
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

    history.push(`/${hostID}/${machineID}/`);
  });

  const error = (
    query.error
    ?? submit.error
    ?? addPartsMutation.error
    ?? printMutationResult.error
    ?? sliceMutation.error
    ?? slicePrintFile.error
  );

  const isMutationPending = (
    submit.loading
    || addPartsMutation.loading
    || printMutationResult.loading
    || sliceMutation.loading
    || slicePrintFile.loading
  );

  if (error) {
    throw error
  }

  if (query.loading) {
    return <div/>
  }

  const currentPrintFile = printFileIndex >= 0 ? printFiles[printFileIndex] : null;

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

  const onEvent = (event) => {
    if (event.type === 'transform') {
      const {
        source,
        ...attrs
      } = event;

      // Update the print file and invalidate the GCode when the user modifies the model transform
      updatePrintFileAttrs({
        // ...attrs,
        gcodeVersion: null,
        gcodeBlob: null,
        gcodeText: null,
      })

      setPrintFiles(printFiles => printFiles.map(p => (
        p.id === currentPrintFile.id ? { ...p, ...attrs } : p
      )))
      console.log('transform!', event);
    }
  }

  const machine = data?.machines[0];

  return (
    <PrintViewerCore {...{
      machine,
      slicerEngine,
      printFile: currentPrintFile,
      onEvent,
      hideCanvas: printFileIndex === -1,
      render: ({
        renderer,
        viewMode,
        data: { topLayer },
      }) => (
        <PrintPreview {...{
          key: printFileIndex,
          renderer,
          topLayer,
          viewMode,
          machine,
          featureFlags: data.featureFlags ?? [],
          slicerEngine,
          printQueues: data.printQueues,
          printFiles,
          setPrintFiles,
          printFile: currentPrintFile,
          printFileIndex,
          setPrintFileIndex,
          addFiles,
          loading: query.loading,
          isMutationPending,
          isUploading: submit.loading,
          setQuantity: (quantity) => {
            updatePrintFileAttrs({ quantity })
          },
          addToQueue: () => submit.execute({ printNow: false }),
          printNow: () => submit.execute({ printNow: true }),
          sliceMutation,
          slice: async () => {
            const res = await fetch(currentPrintFile.url);
            const blob = await res.blob();

            const attrs = await slicePrintFile.execute({ printFile: currentPrintFile, blob })
          },
        }} />
      )
    }}/>
  )
}

export default PrintPage
