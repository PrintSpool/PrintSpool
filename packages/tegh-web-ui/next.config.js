console.log('next config!')

module.exports = {
  exportPathMap: function() {
    return {
      '/': { page: '/index' },
      '/manual-control': { page: '/manual-control' },
    }
  },
}
