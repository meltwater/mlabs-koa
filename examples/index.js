import 'source-map-support/register'

import path from 'path'

import createExamples from '@meltwater/examplr'
import createLogger from '@meltwater/mlabs-logger'

import server from './server'

export const examples = {
  server
}

const envVars = [
  'LOG_LEVEL',
  'LOG_OUTPUT_MODE'
]

const defaultOptions = {}

if (require.main === module) {
  const { runExample } = createExamples({
    createLogger,
    examples,
    envVars,
    defaultOptions
  })

  runExample({
    local: path.resolve(__dirname, 'local.json')
  })
}
