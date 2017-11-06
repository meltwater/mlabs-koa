const rules = {
  disallow: ['User-agent: *', 'Disallow: /', '']
}

export default ({rule = 'disallow'} = {}) => async ctx => {
  ctx.body = rules[rule].join('\n')
}
