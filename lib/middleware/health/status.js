import {
  both,
  hasIn,
  identity,
  ifElse,
  isNil,
  isNotObjLike,
  isObjLike,
  isString,
  propOr,
  stubNull
} from '@meltwater/phi'

export default ({ status = () => null } = {}) => async (ctx, next) => {
  const data = await status()

  ctx.status = 200

  if (isNotObjLike(data)) {
    ctx.body = { data }
    return next()
  }

  const error = ifElse(
    isNil,
    stubNull,
    ifElse(isString, identity, propOr(null, 'message'))
  )(data.error)

  const date = ifElse(
    both(isObjLike, hasIn('toJSON')),
    (x) => x.toJSON(),
    identity
  )(data.date)

  ctx.body = { data: { ...data, date, error } }
  return next()
}
