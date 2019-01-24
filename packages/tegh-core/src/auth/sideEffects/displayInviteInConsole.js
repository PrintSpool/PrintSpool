import * as qrcode from 'qrcode-terminal'

const displayInviteInConsole = ({ invite }) => {
  const thickLine = `${'='.repeat(80)}\n`
  const thinLine = `${'-'.repeat(80)}\n`

  const splitInto80CharLines = string => (
    string.match(/.{1,80}/g).join('\n')
  )

  qrcode.generate(invite.code, { small: true }, (qr) => {
    /* eslint-disable no-console, prefer-template, comma-dangle */
    console.error(
      '\n\n\n'
      + 'Invite Code\n'
      + thickLine + '\n'
      + `${qr}\n`
      + `${splitInto80CharLines(invite.code)}\n\n`
      + thickLine + '\n'
      + 'Your almost ready to start 3D Printing! To connect to your printer:\n\n'
      + '1. Install the Beaker Distributed Web Browser from https://beakerbrowser.com/\n'
      + '2, Go to dat://tegh.io and use the Invite Code above.\n\n'
      + thickLine
      + '\n'
    )
    /* eslint-enable */
  })
}

export default displayInviteInConsole
