import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

import Typography from '@material-ui/core/Typography'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import MuiLink from '@material-ui/core/Link'

import ServerBreadcrumbs from '../common/ServerBreadcrumbs'

const BreadcrumbLink = (props) => (
  <MuiLink
    // style={{ textDecoration: 'none' }}
    // color="textPrimary"
    variant="h6"
    component={RouterLink}
    {...props}
  />
)

const PartHeader = ({
  machineName,
  part,
  value,
}) => {
  return (
    <>
      <div style={{ marginTop: 16, marginLeft: 16, marginRight: 16, marginBottom: 16}}>
        <ServerBreadcrumbs machineName={machineName}>
          <Typography color="textPrimary">{part.name}</Typography>
        </ServerBreadcrumbs>
      </div>

      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab
          label="Current Prints"
          component={RouterLink}
          to="./"
        />
        <Tab
          label="Print History"
          component={RouterLink}
          to="./print-history"
        />
        <Tab
          label="Settings"
          component={RouterLink}
          to="./settings"
        />
      </Tabs>
    </>
  )
}

export default PartHeader
