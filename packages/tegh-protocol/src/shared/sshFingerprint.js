import forge from 'node-forge'

const sshFingerprint = (publicKey) => {
  const pkiKey = forge.pki.publicKeyFromPem(publicKey)
  return forge.ssh.getPublicKeyFingerprint(pkiKey, {
    encoding: 'hex',
    delimiter: ':',
    md: forge.md.sha256.create(),
  })
}

export default sshFingerprint
