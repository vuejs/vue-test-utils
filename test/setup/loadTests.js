const testsContext = require.context('../specs', true, /\.spec\.(js|vue)$/)

testsContext.keys().forEach(testsContext)
