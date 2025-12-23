module.exports = {
  nodeID: null,
  namespace: "ebm",
  logger: true,
  logLevel: "info",

  transporter: process.env.TRANSPORTER || "TCP",

  cacher: {
    type: "Memory",
    options: {
      ttl: 60 // seconds
    }
  },

  serializer: "JSON",

  requestTimeout: 10 * 1000,
  retryPolicy: {
    enabled: true,
    retries: 3,
    delay: 100,
    maxDelay: 1000,
    factor: 2,
    check: err => err && !!err.retryable
  },

  maxCallLevel: 100,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,

  contextParamsCloning: false,

  tracking: {
    enabled: true,
    shutdownTimeout: 5000
  },

  disableBalancer: false,

  registry: {
    strategy: "RoundRobin",
    preferLocal: true
  },

  circuitBreaker: {
    enabled: true,
    threshold: 0.5,
    minRequestCount: 20,
    windowTime: 60,
    halfOpenTime: 10 * 1000,
    check: err => err && err.code >= 500
  },

  bulkhead: {
    enabled: true,
    concurrency: 10,
    maxQueueSize: 100
  },

  validator: true,

  metrics: {
    enabled: true,
    reporter: [
      {
        type: "Console",
        options: {
          interval: 60
        }
      }
    ]
  },

  tracing: {
    enabled: true,
    exporter: [
      {
        type: "Console",
        options: {
          logger: null,
          colors: true,
          width: 100,
          gaugeWidth: 40
        }
      }
    ]
  }
};
