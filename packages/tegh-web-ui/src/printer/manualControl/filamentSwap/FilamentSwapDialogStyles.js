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
  adjustFilament: {
    display: 'none',
  },
  adjustFilamentInstructions: {

  },
}))

export default useStyles
