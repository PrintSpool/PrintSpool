import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  root: {
    // width: '100%',
    // display: 'grid',
    '& > div': {
      width: '100vw',
      height: '100vh',
      overflowX: 'hidden',
    //   width: '100%',
    //   display: 'grid',
    },
  },
}))

export default useStyles
