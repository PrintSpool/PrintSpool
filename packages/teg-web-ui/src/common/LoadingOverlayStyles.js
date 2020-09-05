import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr',
  },
  loading: {
    gridArea: '1 / 1',
    display: 'grid',
    background: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  },
  content: {
    gridArea: '1 / 1',
  },
}))

export default useStyles
