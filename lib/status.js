import EventEmitter from 'events'

const isReady = ({isStaleConfig, isStarted, isHealthy}) => (
  isStarted && isHealthy && !isStaleConfig
)

export default () => {
  const emitter = new EventEmitter()

  const status = {
    isStaleConfig: false,
    isStarted: false,
    isHealthy: false
  }

  emitter.on('stale', () => { status.isStaleConfig = true })

  emitter.on('started', () => { status.isStarted = true })
  emitter.on('stopped', () => { status.isStarted = false })

  emitter.on('healthy', () => { status.isHealthy = true })
  emitter.on('unhealthy', () => { status.isHealthy = false })

  return {
    on: (e, cb) => emitter.on(e, cb),
    emit: e => { emitter.emit(e) },
    isReady: () => isReady(status)
  }
}
