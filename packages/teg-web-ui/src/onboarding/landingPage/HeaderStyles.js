import { makeStyles } from '@material-ui/styles'

import greenPathSVG from 'url:./images/greenPath.svg'
import orangePathSVG from 'url:./images/orangePath.svg'

const pathWidth = 83

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    marginTop: 80,
    marginBottom: 50,
    height: 116,
    overflow: 'visible',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
      height: 50,
      gridTemplateColumns: 'auto',
      height: 'auto',
      marginLeft: theme.spacing(-4),
      marginRight: theme.spacing(-4),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
  },
  greenRoot: {
    backgroundColor: '#05CB0D',
    gridTemplateColumns: 'max-content auto',
    gridTemplateAreas: '"path title"',
  },
  orangeRoot: {
    backgroundColor: '#FF7A00',
    gridTemplateColumns: 'auto max-content',
    gridTemplateAreas: '"title path"',
  },
  path: {
    gridArea: 'path',
    backgroundColor: '#fafafa',
    backgroundImage: `url(${greenPathSVG})`,
    backgroundRepeat: 'no-repeat',
    width: pathWidth,
    height: 156,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  greenPath: {
    backgroundImage: `url(${greenPathSVG})`,
  },
  orangePath: {
    backgroundImage: `url(${orangePathSVG})`,
    marginTop: -40,
  },
  title: {
    gridArea: 'title',
    color: 'white',
    lineHeight: '116px',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: '3rem',
    fontWeight: 100,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
      lineHeight: '60px',
      fontWeight: 500,
    },
  },
}), { useTheme: true })

export default useStyles
