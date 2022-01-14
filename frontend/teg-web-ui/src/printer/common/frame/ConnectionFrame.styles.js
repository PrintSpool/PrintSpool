import makeStyles from '@mui/styles/makeStyles';

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto 1fr',
    width: '100vw',
    height: '100vh',
    // minHeight: '100vh',
    overflow: 'hidden',
  },
  topNavigation: {
    gridColumn: '1 / 3',
    gridRow: '1',
  },
  content: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    // width: '100%',
    // overflowY: 'scroll',
    overflow: 'hidden',
  },
  drawer: {
    gridColumn: '1',
    gridRow: '2',
  },
}))

export default useStyles
