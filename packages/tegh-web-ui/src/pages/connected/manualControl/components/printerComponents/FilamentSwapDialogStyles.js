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
    alignSelf: 'center',
    // display: 'grid',
    // grid: 'max-content max-content / auto',
  },
  heatingOverlay: {
    display: 'none',
  },
  activeHeatingOverlay: {
    gridArea: '1 / 1 / span 2',
    display: 'grid',
    gridTemplateRows: 'auto',
    background: 'rgba(255,255,255,0.7)',
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
