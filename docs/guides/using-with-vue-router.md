## Using with Vue Router

### Installing Vue Router in tests

You should never install Vue Router on the Vue base constructor in tests. Installing Vue Router adds `$route` and `$router` as read-only properties on Vue prototype.

To avoid this, we can create a localVue, and install Vue Router on that.

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallowMount(Component, {
  localVue,
  router
})
```

> **Note:** Installing Vue Router on a `localVue` also adds `$route` and `$router` as read-only properties to a `localVue`. This means you can not use the `mocks` option to overwrite `$route` and `$router` when mounting a component using a `localVue` with Vue Router installed.

### Testing components that use `router-link` or `router-view`

When you install Vue Router, the `router-link` and `router-view` components are registered. This means we can use them anywhere in our application without needing to import them.

When we run tests, we need to make these Vue Router components available to the component we're mounting. There are two methods to do this.

### Using stubs

```js
import { shallowMount } from '@vue/test-utils'

shallowMount(Component, {
  stubs: ['router-link', 'router-view']
})
```

### Installing Vue Router with localVue

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

shallowMount(Component, {
  localVue
})
```

### Mocking `$route` and `$router`

Sometimes you want to test that a component does something with parameters from the `$route` and `$router` objects. To do that, you can pass custom mocks to the Vue instance.

```js
import { shallowMount } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$route.path // /some/path
```

### Common gotchas

Installing Vue Router adds `$route` and `$router` as read-only properties on Vue prototype.

This means any future tests that try to mock `$route` or `$router` will fail.

To avoid this, never install Vue Router globally when you're running tests; use a `localVue` as detailed above.
