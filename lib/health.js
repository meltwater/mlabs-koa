import { asValue } from 'awilix'

export const createHealthCheck = name => container => {
  const subcontainer = container.createScope()
  const log = subcontainer.resolve('log')
  const childLog = log.child({ isHealthLog: true })
  subcontainer.register('log', asValue(childLog))
  return subcontainer.resolve(name)
}
