import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TextField from '@material-ui/core/TextField'
import MuiLink from '@material-ui/core/Link'

import useStyles from './edit/EditPart.styles.js'

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
  part,
  value,
}) => {
  return (
    <>
      <Breadcrumbs
        separator={(
          <Typography variant="h6" component="div">
            /
          </Typography>
        )}
      >
        <BreadcrumbLink to="../..">
          Print Queue
        </BreadcrumbLink>
        <BreadcrumbLink to="./">
          {part.name}
        </BreadcrumbLink>
      </Breadcrumbs>

      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab
          label="Part"
          component={RouterLink}
          to="./"
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
