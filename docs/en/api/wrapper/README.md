# `Wrapper`

Vue Test Utils is a wrapper based API.

A `Wrapper` is an object that contains a mounted component or vnode and methods to test the component or vnode.

- **Properties:**

`vm` `Component`: this is the `Vue` instance. You can access all the [instance methods and properties of a vm](https://vuejs.org/v2/api/#Instance-Properties) with `wrapper.vm`. This only exists on Vue component wrappers  
`element` `HTMLElement`: the root DOM node of the wrapper  
`options` `Object`: Object containing Vue Test Utils options passed to `mount` or `shallowMount`  
`options.attachedToDocument` `Boolean`: True if `attachedToDocument` was passed to `mount` or `shallowMount`  
`options.sync` `Boolean`: True if `sync` was not passed as `false` to `mount` or `shallowMount`

- **Methods:**

There is a detailed list of methods in the wrapper section of the docs.
