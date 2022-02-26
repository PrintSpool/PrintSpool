import React, { useEffect } from 'react'
import { Link, useParams, useHistory } from 'react-router-dom';

import Box from '@mui/material/Box';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import BottomNavigation from '@mui/material/BottomNavigation';

import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import EditIcon from '@mui/icons-material/CropRotate';
import SettingsIcon from '@mui/icons-material/Tune';
import DeleteIcon from '@mui/icons-material/Delete';

import useConfirm from '../../common/_hooks/useConfirm';

const hideFeatureStubs = true;

const meshFileExtensions = [
  // 'amf',
  'stl',
]

export const allFileExtensions = ({ featureFlags }) => [
  ...(featureFlags.includes('slicer') ? meshFileExtensions : []),
  'gcode',
  'ngc',
].map(v => `.${v}`).join(',')

const BottomNavigationMobileView = ({
  renderer,
  printFiles,
  printFile,
  setPrintFileIndex,
  setPrintFiles,
  slice,
  isMutationPending,
  baseURL,
  slicingFeedback,
}) => {
  const { printFileID, tab } = useParams();
  const history = useHistory();

  useEffect(() => {
    if (printFileID !== printFile.id) {
      setPrintFileIndex(printFiles.findIndex(p => p.id === printFileID))
    }
  }, [printFileID])

  // The /:printFileID/ route is context dependent showing GGode or the model depending on if
  // the file is a mesh or not (if it's not a mesh there isn't any model to show)
  const tabsOrder = [
    undefined,
    'gcode',
    'edit',
    'settings',
  ]

  console.log(tab, tabsOrder.indexOf(tab))

  useEffect(() => {
    if (renderer != null) {
      renderer.send({ setCameraPosition: 'isometric' });
    }
  }, [renderer == null])

  // Set the view mode and trigger slicing depending on the tab
  useEffect(() => {
    if (tab === undefined && renderer != null) {
      renderer.send({ setViewMode: 'model' })
    }

    if (tab === 'gcode' && renderer != null) {
      if (isMutationPending || printFile.meshVersion === printFile.gcodeVersion) {
        renderer.send({ setViewMode: 'gcode' })
      } else {
        slice(printFile)
      }
    }
  }, [
    tab,
    printFile.meshVersion,
    printFile.gcodeVersion,
    isMutationPending,
    renderer == null,
  ])

  const confirm = useConfirm()

  const confirmedDelete = confirm(() => {
    return {
      fn: () => {
        history.push(`../`)
        setPrintFileIndex(printFiles.length > 1 ? 0 : -1)
        setPrintFiles(printFiles.filter((p) => p.id !== printFile.id))
      },
      title: `Remove from upload?`,
      description: printFile.name,
    }
  })

  return (
    <Box
      sx={{
        zIndex: 10,
        gridRow: 'ft',
        gridColumn: 'main',
        alignSelf: 'end',
      }}
    >
      { slicingFeedback }
      <BottomNavigation
        // showLabels
        value={printFile.isMesh ? tabsOrder.indexOf(tab) : 1}
      >
        {printFile.isMesh && (
          <BottomNavigationAction
            label="Model"
            icon={<LayersClearIcon />}
            component={Link}
            to={`${baseURL}/${printFile?.id}/`}
          />
        )}
        <BottomNavigationAction
          label="GCode"
          icon={<LayersIcon />}
          component={Link}
          to={`${baseURL}/${printFile?.id}/${printFile.isMesh ? 'gcode' : ''}`}
        />
        {printFile.isMesh && (
          <BottomNavigationAction
            key="edit"
            label="Edit"
            icon={<EditIcon />}
            component={Link}
            to={`${baseURL}/${printFile?.id}/edit/rotate`}
          />
        )}
        {false && printFile.isMesh && (
          <BottomNavigationAction
            key="profile"
            label="Profile"
            icon={<SettingsIcon />}
            component={Link}
            to={`${baseURL}/${printFile?.id}/profile/`}
          />
        )}
        <BottomNavigationAction
          label="Delete"
          icon={<DeleteIcon />}
          onClick={confirmedDelete}
        />
      </BottomNavigation>
    </Box>
  )
}

export default BottomNavigationMobileView
