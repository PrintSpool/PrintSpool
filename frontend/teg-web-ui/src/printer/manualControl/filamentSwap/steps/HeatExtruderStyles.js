import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto',
    background: 'rgba(255, 255, 255, 1)',
    zIndex: 10,
    placeSelf: 'stretch',
  },
  title: {
    gridArea: '1 / 1',
    placeSelf: 'center',
    zIndex: 10,
  },
  chart: {
    gridArea: '1 / 1',
    placeSelf: 'stretch',
  },
}))

export default useStyles
