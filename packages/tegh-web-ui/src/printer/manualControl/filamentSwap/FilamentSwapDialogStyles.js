import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
  },
  step: {
    height: '100%',
    minHeight: '60vh',
    display: 'grid',
    gridTemplateRows: 'auto max-content',
    alignItems: 'center',
  },
  saving: {
    gridArea: '1 / 1',
    backgroundColor: 'white',
    placeSelf: 'stretch',
  },
  introRoot: {
  },
  skipToFilamentSelectionButton: {
    float: 'right',
  },
  retractRoot: {
    textAlign: 'center',
  },
  removeFilamentRoot: {
  },
  selectMaterialRoot: {
    gridArea: '1 / 1',
  },
  loadFilamentRoot: {
    gridArea: '1 / 1',
  },
}))

export default useStyles
