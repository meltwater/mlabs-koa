import http from 'http'

export const httpGetJson = (options) =>
  new Promise((resolve, reject) => {
    const url = typeof options === 'string' ? options : options.url
    const headers = { accept: 'application/json', ...options.headers }
    http
      .get(url, { ...options, headers }, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
          data += chunk
        })
        resp.on('end', () => {
          try {
            const isJson = /application\/json/.test(
              resp.headers['content-type']
            )
            if (!isJson) {
              reject(new Error('Received non-JSON response'))
              return
            }
            const json = JSON.parse(data)
            resolve(json)
          } catch (err) {
            reject(err)
          }
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
