import path from 'path'

import { createExamples } from '@meltwater/examplr'
import { createLogger } from '@meltwater/mlabs-logger'

import { noLifecycle } from './filters'
import health from './health'
import micro from './micro'
import server from './server'

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

if (require.main === module) {
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
}
