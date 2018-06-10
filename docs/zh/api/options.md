# 挂载选项

即 `mount` 和 `shallowMount` 的选项。该对象同时包含了 Vue Test Utils 挂载选项和其它选项。

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`provide`](#provide)
- [`sync`](#sync)

## context

- 类型：`Object`

将上下文传递给函数式组件。该选项只能用于函数式组件。

示例：

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```

## slots

- 类型：`{ [name: string]: Array<Component>|Component|string }`

为组件提供一个 slot 内容的对象。该对象中的键名就是相应的 slot 名，键值可以是一个组件、一个组件数组、一个字符串模板或文本。

示例：

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // 将会匹配 `<slot name="FooBar" />`。
    foo: '<div />',
    bar: 'bar'
  }
})
expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- 类型：`{ [name: string]: string }`

提供一个该组件所有作用域插槽内容的对象。每个键对应到插槽的名字，每个值可以是一个模板字符串。

这里有三处限制。

* 该选项只支持 vue@2.5+。

* 你不能在 `scopedSlots` 选项中将 `<template>` 标签用作其根元素。

* 我们不支持 PhantomJS。  
你可以使用 [Puppeteer](https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer) 作为替代品。

示例：

```js
const wrapper = shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="props">{{props.index}},{{props.text}}</p>'
  }
})
expect(wrapper.find('#fooWrapper').html()).toBe('<div id="fooWrapper"><p>0,text1</p><p>1,text2</p><p>2,text3</p></div>')
```

## stubs

- 类型：`{ [name: string]: Component | boolean } | Array<string>`

将子组件存根。可以是一个要存根的组件名的数组或对象。如果 `stubs` 是一个数组，则每个存根都是一个 `<${component name}-stub>`。

示例：

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // 使用一个特定的实现作为存根
    'registered-component': Foo,
    // 使用创建默认的实现作为存根
    'another-component': true
  }
})
```

## mocks

- 类型：`Object`

为示例添加额外的属性。在伪造全局注入的时候有用。

示例：

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

## localVue

- 类型：`Vue`

通过 [`./createLocalVue.md`] 创建的一个 `Vue` 的本地拷贝，用于挂载该组件的时候。在这份拷贝上安装插件可以防止原始的 `Vue` 被污染。

示例：

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
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

## attachToDocument

- 类型：`boolean`
- 默认值：`false`

当设为 `true` 时，组件在渲染时将会挂载到 DOM 上。

## attrs

- 类型：`Object`

设置组件实例的 `$attrs` 对象。

## listeners

- 类型：`Object`

设置组件实例的 `$listeners` 对象。

## provide

- 类型：`Object`

为组件传递用于注入的属性。可查阅 [provie/inject](https://cn.vuejs.org/v2/api/#provide-inject) 了解更多。

## sync

- 类型：`boolean`
- 默认值：`true`

当 `sync` 是 `true` 时，这个 Vue 组件会被同步渲染。  
当 `sync` 是 `false` 时，这个 Vue 组件会被异步渲染。

## 其它选项

当 `mount` 和 `shallowMount` 的选项包含了挂载选项之外的选项时，则会将它们通过[扩展](https://vuejs.org/v2/api/#extends)覆写到其组件选项。

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo () {
      return 'a'
    },
    bar () {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar () {
      return 'B'
    },
    baz () {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```
