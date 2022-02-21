import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import { allFileExtensions } from './PrintPreview.view';
import FileInput from '../../common/FileInput'
import { PrintFile } from './PrintViewerCore.view'

const AllPartsView = ({
  featureFlags,
  printFiles,
  setPrintFiles,
  setPrintFileIndex,
  addFiles,
}) => {
  const [selection, setSelection] = useState([])

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      editable: true,
      sortable: false,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      width: 110,
      editable: true,
      sortable: false,
    },
    {
      field: 'preview',
      headerName: 'Preview',
      width: 110,
      sortable: false,
      renderCell: ({ row }) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setPrintFileIndex(printFiles.indexOf(row))}
        >
          Preview
        </Button>
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          mt: 2,
          mb: 2,
        }}
      >
        <Button
          component="label"
          variant="outlined"
          startIcon={<AddIcon/>}
        >
          <FileInput
            accept={allFileExtensions({ featureFlags })}
            multiple
            onClick={addFiles}
          />
          Add
        </Button>

        <Button
          component="label"
          variant="outlined"
          startIcon={<DeleteIcon/>}
          color="error"
          sx={{
            ml: 2,
          }}
          disabled={selection.length === 0}
          onClick={() => {
            setPrintFiles(printFiles.filter((p) => !selection.includes(p.id)))
            setSelection([])
          }}
        >
          Remove ({selection.length})
        </Button>
      </Box>

      <DataGrid
        rows={console.log({ printFiles }) as any|| printFiles}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
        disableColumnMenu
        autoHeight
        selectionModel={selection}
        onSelectionModelChange={(nextSelection) => setSelection(nextSelection)}
        onCellEditCommit={({ field, id, value }) => {
          console.log({ field, id, value, printFiles })
          setPrintFiles(printFiles => printFiles.map(p => (
            p.id === id ? { ...p, [field]: value} : p
          )))
        }}
      />
    </>
  )
}

export default AllPartsView
