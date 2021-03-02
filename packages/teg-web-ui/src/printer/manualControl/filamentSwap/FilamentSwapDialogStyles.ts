import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
  },
  notReadyWhiteout: {
    gridArea: '1 / 1',
    backgroundColor: '#fff',
    placeSelf: 'stretch',
  },
  swipeableViews: {
    gridArea: '1 / 1',
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
  editMaterialsLink: {
    marginTop: theme.spacing(2),
  },
  loadFilamentRoot: {
    gridArea: '1 / 1',
  },
}))

export default useStyles
