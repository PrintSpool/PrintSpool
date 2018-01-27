import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  withStyles,
} from 'material-ui'

const styles = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  verticalReset: {
    marginTop: 64,
  }
}

const Header = ({ classes }) => (
  <div>
    <AppBar color="inherit">
      <Toolbar>
        {/*
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
        */}
        <Typography type="title" color="inherit" className={classes.flex}>
          Tegh
        </Typography>
        <Button color="secondary" raised>ESTOP</Button>
      </Toolbar>
    </AppBar>
    <div className={classes.verticalReset} />
  </div>
)

export default withStyles(styles)(Header)
