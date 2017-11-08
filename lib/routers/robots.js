import {
  both,
  has,
  isArrayLike,
  isNonEmptyString,
  isNotObj,
  propSatisfies
} from '@meltwater/phi'

const errPrefix = 'Robots middleware:'

const defaultRules = {
  disallow: ['User-agent: *', 'Disallow: /']
}

export default ({
  rule = 'disallow',
  rules = defaultRules
} = {}) => {
  if (isNotObj(rules)) {
    throw new Error(`${errPrefix} option 'rules' must be object, got ${typeof rules}.`)
  }

  if (!isNonEmptyString(rule)) {
    throw new Error(`${errPrefix} option 'rule' must be string, got ${typeof rule}.`)
  }

  const isValidRule = both(has(rule), propSatisfies(isArrayLike, rule))
  if (!isValidRule(rules)) {
    throw new Error(`${errPrefix} bad or missing rule.`)
  }

  const body = [...rules[rule], ''].join('\n')

  return (ctx) => { ctx.body = body }
}
