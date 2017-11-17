# Vue Router 사용하기

## 테스트에 Vue Router 설치

You should never install Vue Router on the Vue base constructor in tests. Installing Vue Router adds `$route` and `$router` as read-only properties on Vue prototype.

To avoid this, we can create a localVue, and install Vue Router on that.

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## `router-link` 또는`router-view`를 사용하는 테스트 컴포넌트

When you install Vue Router, the `router-link` and `router-view` components are registered. This means we can use them anywhere in our application without needing to import them.

When we run tests, we need to make these vue-router components available to the component we're mounting. There are two methods to do this.

### 스텁 사용하기

```js
shallow(Component, {
  stubs: ['router-link', 'router-view']
})
```

### localVue에 Vue Router 설치

```js
import VueRouter from 'vue-router'
const localVue = createLocalVue()

localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## `$route`와 `$router` 목킹

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

Installing Vue Router adds `$route` and `$router` as read-only properties on Vue prototype.

This means any future tests that try to mock `$route` or `$router` will fail.

To avoid this, never install Vue Router when you're running tests.
