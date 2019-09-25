import createLogger, { final } from '@meltwater/mlabs-logger'
import {
  defaultTo,
  defaultWhen,
  has,
  isNilOrEmpty,
  isNotObj
} from '@meltwater/phi'

import splitName from './split-name'

const defaultWhenNilOrEmpty = defaultWhen(isNilOrEmpty)

export const logAndExit = ({
  msg,
  log = createLogger(),
  level = 'fatal',
  code = 1
} = {}) => {
  const handler = (err, finalLog) => {
    const props = { isLifeCycleLog: true, isAppLog: false }
    finalLog[level]({ err, ...props }, msg)
    process.exit(code)
  }
  try {
    return final(log, handler)
  } catch (err) {
    return err => handler(err, log)
  }
}

export default ({ config, logFilters = {} }) => {
  const [defaultService, defaultSystem] = splitName(config.get('pkg:name'))

  const {
    env,
    name = config.get('pkg:name'),
    version = config.get('pkg:version'),
    service = defaultService,
    system = defaultSystem,
    outputMode = 'short',
    filter = null,
    base = {},
    ...logConfig
  } = defaultTo({}, config.get('log'))

  const logBase = {
    '@service': defaultWhenNilOrEmpty(service, config.get('LOG_SERVICE')),
    '@system': defaultWhenNilOrEmpty(system, config.get('LOG_SYSTEM')),
    '@env': defaultWhenNilOrEmpty(env, config.get('LOG_ENV')),
    version: defaultWhenNilOrEmpty(version, config.get('LOG_VERSION')),
    isAppLog: true,
    ...base
  }

  const getDevLogConfig = () => {
    const filterName = defaultWhenNilOrEmpty(filter, config.get('LOG_FILTER'))

    if (filterName && !has(filterName, logFilters)) {
      throw new Error(`Log output filter ${filterName} not found.`)
    }

    const outputFilter = filterName ? logFilters[filterName] : null

    return {
      outputFilter,
      outputMode: defaultWhenNilOrEmpty(outputMode, config.get('LOG_OUTPUT_MODE'))
    }
  }

  if (isNotObj(logConfig)) {
    throw new Error(`Config key 'log' must be object, got ${typeof logConfig}.`)
  }

  const logLevel = config.get('LOG_LEVEL')

  return {
    name,
    base,
    outputMode,
    ...(config.get('env:development') ? getDevLogConfig() : {}),
    ...logConfig,
    ...(config.get('env:production') ? { outputMode: null, base: logBase } : {}),
    ...(isNilOrEmpty(logLevel) ? {} : { level: logLevel })
  }
}
