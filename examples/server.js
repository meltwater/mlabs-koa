import { createContainer, Lifetime } from 'awilix'
import Koa from 'koa'

import { createServer } from '../lib'

const { SINGLETON } = Lifetime

const createStart = ({log}) => async () => {}
const createStop = ({log}) => async () => {}
const createApp = ({log} = {}) => {
  const app = new Koa()
  return app
}

export default ({log}) => async (port = 9000) => {
  const createDependencies = ({config}) => {
    const container = createContainer()

    container.registerValue({log})
    container.registerFunction({start: [createStart, {lifetime: SINGLETON}]})
    container.registerFunction({stop: [createStop, {lifetime: SINGLETON}]})
    container.registerFunction({app: [createApp, {lifetime: SINGLETON}]})

    return container
  }

  const { configFactory, run } = createServer({
    configPath: __dirname,
    createDependencies
  })

  configFactory.addOverride({port: parseInt(port)})

  run(configFactory)
}
