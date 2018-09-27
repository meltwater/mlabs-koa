import { createServer } from '../lib'

export default ({ log }) => (port = 9000) => {
  const { configFactory, run } = createServer()
  configFactory.addOverride({ port })
  run(configFactory)
  return new Promise(() => {})
}
