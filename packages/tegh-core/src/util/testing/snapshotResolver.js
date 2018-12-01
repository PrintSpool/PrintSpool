export const resolveSnapshotPath = (testPath, snapshotExtension) => (
  testPath
    .replace('/dist/', '/src/')
    .replace(/([^/]+)$/, '__snapshots__/$1')
  + snapshotExtension
)
// resolves from snapshot to test path
export const resolveTestPath = (snapshotFilePath, snapshotExtension) => (
  snapshotFilePath.replace('/src/', '/dist/')
    .replace(/__snapshots__\/([^/]+)$/, '$1')
    .slice(0, -snapshotExtension.length)
)
