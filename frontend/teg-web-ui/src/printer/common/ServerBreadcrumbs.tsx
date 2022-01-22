import React from 'react'

import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import MUILink from '@mui/material/Link'

const ServerBreadcrumbs = ({
  children,
  skipServer = false,
  machineName = null,
  sx = null,
}) => {
  const { hostID, machineID } = useParams()

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={sx}>
      {/* <MUILink color="inherit" component={Link} to="/">
        Servers
      </MUILink> */}
      { !skipServer && (
        <MUILink color="inherit" component={Link} to={`/${hostID}/`}>
          {hostID.length > 15 ? `${hostID.slice(0, 12)}...` : hostID}
        </MUILink>
      )}

      { machineName != null && (
        <MUILink color="inherit" component={Link} to={`/${hostID}/${machineID}/`}>
          {machineName}
        </MUILink>
      )}

      {children}
    </Breadcrumbs>
  )
}

export default ServerBreadcrumbs
