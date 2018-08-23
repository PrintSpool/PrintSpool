module.exports = {
  exportPathMap: function() {
    return {
      '/': { page: '/index' },
      '/:hostFingerprint/': { page: '/host/index' },
      '/:hostFingerprint/manual-control': { page: '/host/manual-control' },
    }
  },
}
