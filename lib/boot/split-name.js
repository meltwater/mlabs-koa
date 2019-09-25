import { either, isEmpty, isNil, join, split } from '@meltwater/phi'

export default name => {
  if (either(isNil, isEmpty)(name)) return []
  const [org, pkg] = split('/', name)
  if (isNil(pkg)) return [org]
  const [system, ...service] = split('-', pkg)
  if (isEmpty(service)) return [system]
  return [join('-', service), system]
}
