import path from 'path'

import { createExamples } from '@meltwater/examplr'
import { createLogger } from '@meltwater/mlabs-logger'

import { noLifecycle } from './filters.js'
import health from './health.js'
import micro from './micro.js'
import server from './server.js'

export const examples = {
  health,
  micro,
  server
}

// prettier-ignore
const envVars = [
  'LOG_LEVEL',
  'LOG_FILTER',
  'LOG_OUTPUT_MODE'
]

const defaultOptions = {}

const { runExample } = createExamples({
  createLogger,
  logFilters: { noLifecycle },
  examples,
  envVars,
  defaultOptions
})

runExample({
  local: path.resolve(__dirname, 'local.json')
})
