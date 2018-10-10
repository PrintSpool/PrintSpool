import sshFingerprint from './sshFingerprint'

const getFingerprint = keys => sshFingerprint(keys.public, 'sha256')

export default getFingerprint
