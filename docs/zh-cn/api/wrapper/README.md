# Wrapper

(翻译中……)

vue-test-utils is a wrapper based API.

A `Wrapper` is an object that contains a mounted component or vnode and methods to test the component or vnode.

- **Properties:**

`vm` `Component`: this is the vue instance. You can access all the [instance methods and properties of a vm](https://vuejs.org/v2/api/#Instance-Properties) with `wrapper.vm`. This only exists on Vue component wrappers
`element` `HTMLElement`: the root DOM node of the wrapper
`options` `Object`: Object containing vue-test-utils options passed to `mount` or `shallow`
`options.attachedToDom` `Boolean`: True if attachToDom was passed to `mount` or `shallow`

- **Methods:**

There is a detailed list of methods in the wrapper section of the docs.
