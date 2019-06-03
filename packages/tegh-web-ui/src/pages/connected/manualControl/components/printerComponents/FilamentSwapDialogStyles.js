import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    height: '60vh',
    display: 'grid',
    gridTemplateRows: 'max-content auto',
  },
  stepper: {
    gridArea: '1 / 1',
  },
  removeFilamentContent: {
    gridArea: '2 / 1',
  },
  heatingOldFilament: {
    gridArea: '2 / 1',
    display: 'grid',
    gridTemplateRows: 'auto',
    background: 'rgba(255, 255, 255, 1)',
    zIndex: 10,
  },
  heatingOverlayHeader: {
    gridArea: '1 / 1',
    placeSelf: 'center',
    zIndex: 10,
  },
  heatingOverlayChart: {
    gridArea: '1 / 1',
    placeSelf: 'stretch',
  },
  adjustFilament: {
    display: 'none',
  },
  adjustFilamentInstructions: {

  },
}))

export default useStyles
