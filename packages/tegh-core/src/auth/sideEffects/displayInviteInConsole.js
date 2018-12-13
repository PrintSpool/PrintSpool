import * as qrcode from 'qrcode-terminal'
import bs58 from 'bs58'

export const INVITE_PROTOCOL_VERSION = 'A'

const displayInviteInConsole = ({ hostDatID, invite }) => {
  const invitePayload = [
    INVITE_PROTOCOL_VERSION,
    hostDatID,
    bs58.encode(invite.privateKey),
  ]

  const inviteString = invitePayload.join('')

  qrcode.generate(inviteString, { small: true }, (qr) => {
    /* eslint-disable no-console, prefer-template, comma-dangle */
    console.error(
      '\n\n'
      + 'Invitation Code\n'
      + '==========================================================\n'
      + 'Use the Beaker Browser to go to dat://tegh.io and use the invite code '
      + 'below to connect:\n'
      + `${qr}\n`
      + `Invite Text:\n${inviteString}`
    )
    /* eslint-enable */
  })
}

export default displayInviteInConsole
