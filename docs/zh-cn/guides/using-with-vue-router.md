# 配合 Vue Router 使用

## 在测试中安装 Vue Router

在测试中，你应该杜绝在基本的 Vue 构造函数中安装 Vue Router。安装 Vue Router 之后 Vue 的原型上会增加 `$route` 和 `$router` 这两个只读属性。

为了避免这样的事情发生，我们创建了一个 `localVue` 并对其安装 Vue Router。

```js
import { shallow, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallow(Component, {
  localVue,
  router
})
```

> **注意：**在一个 `localVue` 上安装 Vue Router 时也会将 `$route` 和 `$router` 作为两个只读属性添加给该 `localVue`。这意味着如果你使用安装了 Vue Router 的 `localVue`，则不能在挂在一个组件时使用 `mocks` 选项来复写 `$route` 和 `$router`。

## 测试使用了 `router-link` 或 `router-view` 的组件

当你安装 Vue Router 的时候，`router-link` 和 `router-view` 组件就被注册了。这意味着我们无需再导入可以在应用的任意地方使用它们。

当我们运行测试的时候，需要令 Vue Router 相关组件在我们挂载的组件中可用。有以下两种做法：

### 使用存根

```js
import { shallow } from '@vue/test-utils'

shallow(Component, {
  stubs: ['router-link', 'router-view']
})
```

### 为 localVue 安装 Vue Router

```js
import { shallow, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## 伪造 `$route` 和 `$router`

有的时候你想要测试一个组件在配合 `$route` 和 `$router` 对象的参数时的行为。这时候你可以传递自定义假数据给 Vue 实例。

```js
import { shallow } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$router.path // /some/path
```

## 常识

安装 Vue Router 会在 Vue 的原型上添加 `$route` 和 `$router` 只读属性。

这意味着在未来的任何测试中，伪造 `$route` 或 `$router` 都会失效。

要想回避这个问题，就不要在运行测试的时候全局安装 Vue Router，而用上述的 `localVue` 用法。
