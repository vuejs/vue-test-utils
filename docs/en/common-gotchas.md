# Common gotchas

## browser environment

Vue Test Utils must be run in a browser environment. This means you can run it in a browser (not recommended), or you can run it in node using a virtual browser, like [JSDOM](https://github.com/tmpvar/jsdom).

[Jest](https://facebook.github.io/jest/docs/en/cli.html) sets up JSDOM automatically, so it is the easiest way for you to run Vue Test Utils in node.

## createLocalVue

`createLocalVue` returns an extended Vue class so you can add mixins, directives, components and plugins without affecting the global Vue class.

Unfortunately, many plugins have internal checks that stop them from being installed more than once.

Currently, **Vuex cannot be installed on more than once instance**. However, you can change the store. So one install should be fine. See the guide on [using with Vuex](guides/using-with-vuex.md)

Also, **Vue Router needs two options set to false to be installed more than once**:

```js
import createLocalVue from 'vue-test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
VueRouter.installed = false
VueRouter.install.installed = false
localVue.use(VueRouter)
```

The alternative is to stub the properties you want to test, instead of installing the plugin.

For example, if your test relies on `this.$route.params.id`, stub `$route` using [intercept](mount.md):

```js
mount(Component, {
  intercept: {
    $route: {
      params: {
        id: true
      }
    }
  }
})
```