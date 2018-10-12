import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

const enhance = compose(
  connect(state => ({
    hosts: state.keys.hostIdentities,
  })),
)

// TODO: perhaps this should be a list of 3D Printers or of Print Queues
const HostsIndex = ({ hosts }) => (
  <div>
    {
      hosts.size === 0 && (
        <div>
          No 3D Printers Saved
          <Link to="/connect">
            <button type="button">
              Connect to your first 3D Printer
            </button>
          </Link>
        </div>
      )
    }
    {
      hosts.toList().map(host => (
        <Link to={`/${host.id}`} key={host.id}>
          <div>
            <div>
              {host.alias}
            </div>
            <div>
              {host.id}
            </div>
          </div>
        </Link>
      ))
    }
  </div>
)

export default enhance(HostsIndex)
