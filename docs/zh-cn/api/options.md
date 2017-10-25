# 挂载选项

即 `mount` 和 `shallow` 的选项。该对象同时包含了 `vue-test-utils` 挂载选项和原始的 Vue 选项。

Vue 选项会在一个新的实例被创建的时候传递给组件。比如 `store`、`propsData`。想查阅完整的列表，请移步 [Vue API 文档](https://cn.vuejs.org/v2/api/)。

## `vue-test-utils` 特定的挂载选项

- [`context`](#context)
- [`slots`](#slots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`clone`](#clone)

### `context`

- 类型：`Object`

将上下文传递给函数式组件。该选项只能用于函数式组件。

示例：

```js
const wrapper = mount(Component, {
  context: {
    props: { show: true }
  }
})

expect(wrapper.is(Component)).toBe(true)
```

### `slots`

- 类型：`{ [name: string]: Array<Component>|Component|string }`

为组件提供一个 slot 内容的对象。该对象中的键名就是相应的 slot 名，键值可以是一个组件、一个组件数组或一个字符串模板。

示例：

```js
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // 将会匹配 `<slot name="FooBar" />`。
    foo: '<div />'
  }
})
expect(wrapper.find('div')).toBe(true)
```

### `stubs`

- 类型：`{ [name: string]: Component | boolean } | Array<string>`

将子组件存根。可以是一个要存根的组件名的数组或对象。

示例：

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallow(Component, {
  stubs: {
    // 使用一个特定的实现作为存根
    'registered-component': Foo,
    // 使用创建默认的实现作为存根
    'another-component': true
  }
})
```

### `mocks`

- 类型：`Object`

为示例添加额外的属性。在伪造全局注入的时候有用。

示例：

```js
import { expect } from 'chai'

const $route = { path: 'http://www.example-path.com' }
const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- 类型：`Vue`

通过 [`./createLocalVue.md`] 创建的一个 `Vue` 的本地拷贝，用于挂载该组件的时候。在这份拷贝上安装插件可以防止原始的 `Vue` 被污染。

示例：

```js
import { createLocalVue, mount } from 'vue-test-utils'
import VueRouter from 'vue-router'
import { expect } from 'chai'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [
  { path: '/foo', component: Foo }
]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

### `attachToDocument`

- 类型：`boolean`
- 默认值：`false`

当设为 `true` 时，组件在渲染时将会挂载到 DOM 上。可以配合 [`hasStyle`](wrapper/hasStyle.md) 检查 CSS 的多元素选择器。

### `attrs`

- 类型：`Object`

设置组件实例的 `$attrs` 对象。

### `listeners`

- 类型：`Object`

设置组件实例的 `$listeners` 对象。

### `clone`

- 类型：`boolean`
- 默认值：`true`

如果为 `true` 则会在挂载之前克隆组件。这样做会回避原始组件定义的突变。

`options.mocks` (`Object`)：向 Vue 实例添加全局属性。

`options.localVue` (`Object`)：在 `mount` 中使用的 `Vue` 类。请移步 [`createLocalVue`](createLocalVue.md)。
