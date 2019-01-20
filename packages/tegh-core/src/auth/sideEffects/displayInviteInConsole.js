import * as qrcode from 'qrcode-terminal'

const displayInviteInConsole = ({ invite }) => {
  const consoleLine = `${'='.repeat(80)}\n`

  qrcode.generate(invite.code, { small: true }, (qr) => {
    /* eslint-disable no-console, prefer-template, comma-dangle */
    console.error(
      '\n\n\n'
      + consoleLine
      + 'Invite Code\n'
      + consoleLine
      + `${qr}\n`
      + `${invite.code}\n\n`
      + 'Your almost ready to start 3D Printing! To connect to your printer:\n\n'
      + '1. Install the Beaker Distributed Web Browser from https://beakerbrowser.com/\n'
      + '2, Go to dat://tegh.io and use the Invite Code above.\n\n'
      + consoleLine
      + '\n'
    )
    /* eslint-enable */
  })
}

export default displayInviteInConsole
