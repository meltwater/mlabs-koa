import fs from 'fs'
import path from 'path'

import { createContainer } from 'awilix'
import confit from 'confit'
import chokidar from 'chokidar'
import { isNotString } from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

import initialize from './init'
import getLoggerOptions from './logger'

const isLifecycle = true
const isDotfile = name => !(/^\./.test(name))

const createConfigFactory = configPath => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  const addOverride = name => {
    if (!fs.existsSync(path.resolve(configPath, `${name}.json`))) return
    factory.addOverride(`./${name}.json`)
  }

  const addOverrides = subpath => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return
    fs.readdirSync(fullPath)
      .filter(isDotfile)
      .filter(name => /\.json$/.test(name))
      .sort()
      .forEach(name => { factory.addOverride(`./${subpath}/${name}`) })
  }

  const addSecrets = subpath => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return

    const readSecret = name => (
      fs.readFileSync(path.resolve(fullPath, name))
        .toString()
        .trim()
    )

    const secret = fs.readdirSync(fullPath)
      .filter(isDotfile)
      .sort()
      .reduce((acc, name) => ({...acc, [name]: readSecret(name)}), {})

    factory.addOverride({secret})
  }

  addSecrets('secret.d')
  addOverrides('env.d')
  addOverride('env')
  addOverrides('local.d')
  addOverride('local')

  factory.addOverride({config: configPath})
  factory.addOverride({pkg})

  return factory
}

const createBootstrap = ({
  createDependencies,
  startServer,
  logFilters,
  watcher
}) => (err, config) => {
  if (err) {
    createLogger().fatal({err, isLifecycle}, 'Config: Fail')
    process.exit(1)
  }

  try {
    const logOptions = getLoggerOptions({config, logFilters})
    const log = createLogger(logOptions)
    const dependencies = createDependencies({config, log})
    initialize({config, dependencies, startServer, watcher, logger: log})
  } catch (error) {
    createLogger().fatal({isLifecycle, err: error}, 'Bootstrap: Fail')
    process.exit(1)
  }
}

export default (
  startServer
) => ({
  configPath = process.cwd(),
  createDependencies = createContainer,
  logFilters
} = {}) => {
  try {
    if (isNotString(configPath)) {
      throw new Error(`Config path must be string, got ${typeof configPath}.`)
    }

    const watcher = chokidar.watch(configPath, {ignoreInitial: true})
    watcher.on('error', err => {
      createLogger().fatal({err, isLifecycle}, 'Watcher: Error')
      process.exit(1)
    }).on('all', () => {
      createLogger().fatal({isLifecycle}, 'Config: Changed')
      process.exit(1)
    })

    const configFactory = createConfigFactory(configPath)
    const bootstrap = createBootstrap({
      createDependencies,
      startServer,
      logFilters,
      watcher
    })

    const exit = err => {
      createLogger().fatal({err, isLifecycle}, 'Exit')
      process.exit(err ? 2 : 0)
    }

    return {
      exit,
      configFactory,
      run: configFactory => configFactory.create(bootstrap)
    }
  } catch (err) {
    createLogger().fatal({err, isLifecycle}, 'Config: Fail')
    process.exit(1)
  }
}
