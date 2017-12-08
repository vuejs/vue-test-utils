# `Wrapper`

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>`vue-test-utils` is a wrapper based API.</p>

A `Wrapper` is an object that contains a mounted component or vnode and methods to test the component or vnode.

- **Properties:**

`vm` `Component`: this is the `Vue` instance. You can access all the [instance methods and properties of a vm](https://vuejs.org/v2/api/#Instance-Properties) with `wrapper.vm`. This only exists on Vue component wrappers  
`element` `HTMLElement`: the root DOM node of the wrapper  
`options` `Object`: Object containing `vue-test-utils` options passed to `mount` or `shallow`  
`options.attachedToDom` `Boolean`: True if `attachToDom` was passed to `mount` or `shallow`  

- **Methods:**

There is a detailed list of methods in the wrapper section of the docs.
