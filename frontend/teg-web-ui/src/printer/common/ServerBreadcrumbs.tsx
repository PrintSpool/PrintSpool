import React from 'react'

import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import MUILink from '@material-ui/core/Link'

const ServerBreadcrumbs = ({
  children,
  skipServer = false,
  machineName = null,
}) => {
  const { hostID, machineID } = useParams()

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {/* <MUILink color="inherit" component={Link} to="/">
        Servers
      </MUILink> */}
      { !skipServer && (
        <MUILink color="inherit" component={Link} to={`/m/${hostID}/`}>
          {hostID.slice(0, 8)}...
        </MUILink>
      )}

      { machineName != null && (
        <MUILink color="inherit" component={Link} to={`/m/${hostID}/${machineID}/`}>
          {machineName}
        </MUILink>
      )}

      {children}
    </Breadcrumbs>
  )
}

export default ServerBreadcrumbs
