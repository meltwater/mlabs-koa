import fs from 'fs'
import path from 'path'

import confit from 'confit'

const isDotfile = (name) => !/^\./.test(name)

export default (configPath) => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  const addOverride = (name) => {
    if (!fs.existsSync(path.resolve(configPath, `${name}.json`))) return
    factory.addOverride(`./${name}.json`)
  }

  const addOverrides = (subpath) => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return
    fs.readdirSync(fullPath)
      .filter(isDotfile)
      .filter((name) => /\.json$/.test(name))
      .sort()
      .forEach((name) => {
        factory.addOverride(`./${subpath}/${name}`)
      })
  }

  const addSecrets = (subpath) => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return

    const readSecret = (name) =>
      fs.readFileSync(path.resolve(fullPath, name)).toString().trim()

    const secret = fs
      .readdirSync(fullPath)
      .filter(isDotfile)
      .sort()
      .reduce((acc, name) => ({ ...acc, [name]: readSecret(name) }), {})

    factory.addOverride({ secret })
  }

  addSecrets('secret.d')
  addOverrides('env.d')
  addOverride('env')
  addOverrides('local.d')
  addOverride('local')

  factory.addOverride({ config: configPath })
  factory.addOverride({ pkg })

  return factory
}
