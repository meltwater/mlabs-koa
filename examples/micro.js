import { createServer } from '../index.js'

export default ({ log }) =>
  (port = 9000) => {
    const { configFactory, run } = createServer()
    configFactory.addOverride({ port })
    run(configFactory)
    return new Promise(() => {})
  }
