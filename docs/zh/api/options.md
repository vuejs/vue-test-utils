# 挂载选项

`mount` 和 `shallowMount` 的选项。

:::tip
除了下方列出的选项，`options` 对象还可以包含任何 `new Vue ({ /*options here*/ })` 调用时的有效选项。
当通过 `mount` / `shallowMount` 挂载时，这些选项将会合并入组件现有的选项中。

[查阅其它选项的例子](#其它选项)
:::

- [`context`](#context)
- [`data`](#data)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachTo`](#attachto)
- [`attachToDocument`](#attachtodocument)
- [`propsData`](#propsdata)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`parentComponent`](#parentcomponent)
- [`provide`](#provide)

## context

- 类型：`Object`

将上下文传递给函数式组件。该选项只能用于[函数式组件](https://cn.vuejs.org/v2/guide/render-function.html#函数式组件)。

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

## data

- 类型：`Function`

向一个组件传入数据。这将会合并到现有的 `data` 函数中。

示例：

```js
const Component = {
  template: `
    <div>
      <span id="foo">{{ foo }}</span>
      <span id="bar">{{ bar }}</span>
    </div>
  `,

  data() {
    return {
      foo: 'foo',
      bar: 'bar'
    }
  }
}

const wrapper = mount(Component, {
  data() {
    return {
      bar: 'my-override'
    }
  }
})

wrapper.find('#foo').text() // 'foo'
wrapper.find('#bar').text() // 'my-override'
```

## slots

- 类型：`{ [name: string]: Array<Component>|Component|string }`

为组件提供一个 slot 内容的对象。该对象中的键名就是相应的 slot 名，键值可以是一个组件、一个组件数组、一个字符串模板或文本。

示例：

```js
import Foo from './Foo.vue'
import MyComponent from './MyComponent.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const yourComponent = {
  props: {
    foo: {
      type: String,
      required: true
    }
  },
  render(h) {
    return h('p', this.foo)
  }
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // 将会匹配 `<slot name="FooBar" />`.
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />',
    quux: '<your-component foo="lorem"/><your-component :foo="yourProperty"/>'
  },
  stubs: {
    // 用来注册自定义组件
    'my-component': MyComponent,
    'your-component': yourComponent
  },
  mocks: {
    // 用来向渲染上下文添加 property
    yourProperty: 'ipsum'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- 类型：`{ [name: string]: string|Function }`

提供一个该组件所有作用域插槽的对象。每个键对应到插槽的名字。

你可以使用 slot-scope 特性设置 prop 的名称：

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

否则插槽被计算的时候可以通过 `props` 对象使用 prop：

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

你也可以传递一个函数将 prop 作为参数带入：

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function(props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

或者你可以使用 JSX。如果你在一个方法里撰写 JSX，babel-plugin-transform-vue-jsx 会自动注入 `this.$createElement`：

```js
shallowMount(Component, {
  scopedSlots: {
    foo(props) {
      return <div>{props.text}</div>
    }
  }
})
```

::: warning 必备根元素
由于该特性内部实现的原因，这里的插槽内容必须返回一个根元素，即使一个作用域插槽是允许返回一个元素数组的。

如果你在测试中有这方面的需要，推荐的变通方式是把被测试的组件包裹在另一个组件里，然后挂载那个组件：
:::

```javascript
const WrapperComp = {
  template: `
  <ComponentUnderTest v-slot="props">
    <p>Using the {{props.a}}</p>
    <p>Using the {{props.a}}</p>
  </ComponentUnderTest>
  `,
  components: {
    ComponentUnderTest
  }
}
const wrapper = mount(WrapperComp).findComponent(ComponentUnderTest)
```

## stubs

- 类型：`{ [name: string]: Component | string | boolean } | Array<string>`

将子组件存根。可以是一个要存根的组件名的数组或对象。如果 `stubs` 是一个数组，则每个存根都是一个 `<${component name}-stub>`。

**废弃通知：**

当对组件存根时，提供一个字符串的方式 (`ComponentToStub: '<div class="stubbed" />`) 已经不再被支持。

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
    // 使用创建默认的实现作为存根。
    // 这里默认存根的组件名是 `another-component`。
    // 默认存根是 `<${the component name of default stub}-stub>`。
    'another-component': true
  }
})
```

## mocks

- 类型：`Object`

为实例添加额外的属性。在伪造全局注入的时候有用。

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

::: tip
如果想要伪造 `$root` 请换用[这里](https://github.com/vuejs/vue-test-utils/issues/481#issuecomment-423716430)描述的 `parentComponent` 选项。
:::

## localVue

- 类型：`Vue`

通过 [`createLocalVue`](./createLocalVue.md) 创建的一个 `Vue` 的本地拷贝，用于挂载该组件的时候。在这份拷贝上安装插件可以防止原始的 `Vue` 被污染。

示例：

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [{ path: '/foo', component: Foo }]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

## attachTo

- 类型：`HTMLElement | string`
- 默认值：`null`

指定一个 `HTMLElement` 或定位到一个 HTML 元素的 CSS 选择器字符串，组件将会被完全挂载到文档中的这个元素。

当要挂载到 DOM 时，你需要在测试的结尾调用 `wrapper.destroy()` 以将该元素从文档中移除，并销毁该组件实例。

```js
const Component = {
  template: '<div>ABC</div>'
}
let wrapper = mount(Component, {
  attachTo: '#root'
})
expect(wrapper.vm.$el.parentNode).to.not.be.null
wrapper.destroy()

wrapper = mount(Component, {
  attachTo: document.getElementById('root')
})
expect(wrapper.vm.$el.parentNode).to.not.be.null
wrapper.destroy()
```

## attachToDocument

- 类型：`boolean`
- 默认值：`false`

::: warning 废弃警告
`attachToDocument` 已经被废弃并且将会在未来的发布中被移除。请换用 [`attachTo`](#attachto)。
:::

像 [`attachTo`](#attachto) 一样，不过会自动创建一个新的 `div` 元素并将其插入到 body 里。

如果添加到了 DOM 上，你应该在测试的最后调用 `wrapper.destroy()` 将元素从文档中移除并销毁组件实例。

## attrs

- 类型：`Object`

设置组件实例的 `$attrs` 对象。

## propsData

- 类型：`Object`

在组件被挂载时设置组件实例的 prop。

示例：

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: tip 提示
值得注意的是 `propsData` 实际上是一个 [Vue API](https://cn.vuejs.org/v2/api/#propsData)，不是 Vue Test Utils 的挂载选项。它会被 [`extends`](https://cn.vuejs.org/v2/api/#extends) 处理。请查阅[其它选项](#其它选项)。
:::

## listeners

- 类型：`Object`

设置组件实例的 `$listeners` 对象。

示例：

```js
const Component = {
  template: '<button v-on:click="$emit(\'click\')"></button>'
}
const onClick = jest.fn()
const wrapper = mount(Component, {
  listeners: {
    click: onClick
  }
})

wrapper.trigger('click')
expect(onClick).toHaveBeenCalled()
```

## parentComponent

- 类型：`Object`

用来作为被挂载组件的父级组件。

示例：

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.$options.name).toBe('foo')
```

## provide

- 类型：`Object`

为组件传递用于注入的属性。可查阅 [provide/inject](https://cn.vuejs.org/v2/api/#provide-inject) 了解更多。

示例：

```js
const Component = {
  inject: ['foo'],
  template: '<div>{{this.foo()}}</div>'
}

const wrapper = shallowMount(Component, {
  provide: {
    foo() {
      return 'fooValue'
    }
  }
})

expect(wrapper.text()).toBe('fooValue')
```

## 其它选项

当 `mount` 和 `shallowMount` 的选项包含了挂载选项之外的选项时，则会将它们通过[扩展](https://cn.vuejs.org/v2/api/#extends)覆写到其组件选项。

```js
const Component = {
  template: '<div>{{ foo }}</div>',
  data() {
    return {
      foo: 'fromComponent'
    }
  }
}
const options = {
  data() {
    return {
      foo: 'fromOptions'
    }
  }
}

const wrapper = mount(Component, options)

expect(wrapper.text()).toBe('fromOptions')
```
