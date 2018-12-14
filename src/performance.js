let performance

if (swan.getPerformance) {
  const { platform } = swan.getSystemInfoSync()
  const swanPerf = swan.getPerformance()
  const initTime = swanPerf.now()

  const clientPerfAdapter = Object.assign({}, swanPerf, {
    now: function() {
      return (swanPerf.now() - initTime) / 1000
    }
  })

  performance = platform === 'devtools' ? swanPerf : clientPerfAdapter
}

export default performance
