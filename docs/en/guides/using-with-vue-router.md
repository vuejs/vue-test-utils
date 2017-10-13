# Using with vue-router

## Installing vue-router in tests

You should never install vue-router on the Vue base constructor in tests. Installing vue-router adds `$route` and `$router` as read-only properties on Vue prototype.

To avoid this, we can create a localVue, and install vue-router on that.

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## Testing components that use router-link or router-view

When you install vue-router, the router-link and router-view components are registered. This means we can use them anywhere in our application without needing to import them.

When we run tests, we need to make these vue-router components available to the component we're mounting. There are two methods to do this.

### Using stubs

```js
shallow(Component, {
  stubs: ['router-link', 'router-view']
})
```

### Installing vue-router with localVue

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## Mocking $route and $router

Sometimes you want to test that a component does something with parameters from the `$route` and `$router` objects. To do that, you can pass custom mocks to the Vue instance.

```js
const $route = {
  path: '/some/path'
}

const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$router // /some/path
```

## Common gotchas

Installing vue-router adds `$route` and `$router` as read-only properties on Vue prototype.

This means any future tests that try to mock $route or `$router` will fail.

To avoid this, never install vue-router when you're running tests.
