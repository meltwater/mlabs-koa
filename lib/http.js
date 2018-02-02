import http from 'http'

export const httpGetJson = url => new Promise((resolve, reject) => {
  http.get(url, resp => {
    let data = ''
    resp.on('data', chunk => { data += chunk })
    resp.on('end', () => { resolve(JSON.parse(data)) })
  }).on('error', err => { reject(err) })
})
