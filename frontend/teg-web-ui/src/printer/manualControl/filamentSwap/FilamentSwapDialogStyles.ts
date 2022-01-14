import makeStyles from '@mui/styles/makeStyles';

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
  updateSettingsBeforeSwap: {
    marginBottom: theme.spacing(2),
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
