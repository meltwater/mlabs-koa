import path from 'path'

import createExamples from '@meltwater/examplr'
import createLogger from '@meltwater/mlabs-logger'

import { noLifecycle } from './filters'
import server from './server'

export const examples = {
  server
}

const envVars = [
  'LOG_LEVEL',
  'LOG_FILTER',
  'LOG_OUTPUT_MODE'
]

const defaultOptions = {}

if (require.main === module) {
  const { runExample } = createExamples({
    createLogger,
    logFilters: {noLifecycle},
    examples,
    envVars,
    defaultOptions
  })

  runExample({
    local: path.resolve(__dirname, 'local.json')
  })
}
