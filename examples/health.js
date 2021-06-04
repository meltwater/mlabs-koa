import { httpGetJson } from '../index.js'

export default ({ log }) =>
  async (host = 'http://localhost:9000') => {
    const url = `${host}/health`
    log.debug({ url }, 'Health')
    const { healthy, error } = await httpGetJson(url)
    if (error) throw new Error(error)
    return healthy
  }
