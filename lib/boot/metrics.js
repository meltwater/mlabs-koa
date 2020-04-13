export const createAppMetrics = ({
  registry,
  metricPrefix,
  metricDefs,
  metricOptions
}) => {
  const register = registry
  const metrics = getMetrics(metricDefs, metricOptions)
  const prefixedMetrics = getPrefixedMetrics(metrics, metricPrefix)
  const getMetric = ({ name, prefixedName }) => ({
    [name]: register.getSingleMetric(prefixedName)
  })
  const singleMetrics = prefixedMetrics.map(getMetric)
  return Object.assign(...singleMetrics)
}

export const createCollectAppMetrics = ({
  metricDefs,
  metricOptions,
  metricPrefix
}) => ({ register }) => {
  const metrics = getMetrics(metricDefs, metricOptions)
  const prefixedMetrics = getPrefixedMetrics(metrics, metricPrefix)
  for (const prefixedMetric of prefixedMetrics) {
    registerAppMetric(prefixedMetric, register)
  }
}

const registerAppMetric = (prefixedMetric, register) => {
  const {
    prefixedName,
    labelNames = [],
    type: MetricType,
    ...args
  } = prefixedMetric
  const metric = new MetricType({
    ...args,
    labelNames,
    name: prefixedName
  })
  register.registerMetric(metric)
}

const getPrefixedMetrics = (metrics, prefix) =>
  metrics.map(({ name, ...rest }) => ({
    prefixedName: `${prefix}${name}`,
    name,
    ...rest
  }))

const getMetrics = (metricDefs, metricOptions) =>
  metricDefs.map((metric) => ({ ...metric, ...metricOptions[metric.name] }))
