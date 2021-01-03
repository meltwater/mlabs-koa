import fs from 'fs'
import path from 'path'

import confit from 'confit'

const isDotfile = (name) => !/^\./.test(name)

export default (configPath) => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath
  })

  const addDefaults = () => {
    const defaultsPath = path.resolve(configPath, 'default.json')
    if (!fs.existsSync(defaultsPath)) return {}
    const data = fs.readFileSync(defaultsPath)
    const defaults = JSON.parse(data.toString())
    factory.addDefault(defaults)
  }

  const addOverride = (name) => {
    const overridePath = path.resolve(configPath, `${name}.json`)
    if (!fs.existsSync(overridePath)) return
    const data = fs.readFileSync(overridePath)
    const override = JSON.parse(data.toString())
    factory.addOverride(override)
  }

  const addOverrides = (subpath) => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return
    fs.readdirSync(fullPath)
      .filter(isDotfile)
      .filter((name) => /\.json$/.test(name))
      .sort()
      .map((name) => path.resolve(fullPath, name))
      .map((overridePath) => fs.readFileSync(overridePath))
      .map((data) => JSON.parse(data.toString()))
      .forEach((override) => {
        factory.addOverride(override)
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

  addDefaults()
  addSecrets('secret.d')
  addOverrides('env.d')
  addOverride('env')
  addOverrides('local.d')
  addOverride('local')

  factory.addOverride({ config: configPath })
  factory.addOverride({ pkg })

  return factory
}
