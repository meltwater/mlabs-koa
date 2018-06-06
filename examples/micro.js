import { createContainer, asValue } from 'awilix'

import { createServer } from '../lib'

const createDependencies = ({log, config}) => {
  const container = createContainer()

  container.register({log: asValue(log)})

  return container
}

export default ({log}) => (port = 9000) => {
  const { configFactory, run } = createServer({
    configPath: __dirname,
    createDependencies
  })

  configFactory.addOverride({port})

  run(configFactory)
  return new Promise(() => {})
}
