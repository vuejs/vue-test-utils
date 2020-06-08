## 常用技巧

### 明白要测试的是什么

对于 UI 组件来说，我们不推荐一味追求行级覆盖率，因为它会导致我们过分关注组件的内部实现细节，从而导致琐碎的测试。

取而代之的是，我们推荐把测试撰写为断言你的组件的公共接口，并在一个黑盒内部处理它。一个简单的测试用例将会断言一些输入 (用户的交互或 prop 的改变) 提供给某组件之后是否导致预期结果 (渲染结果或触发自定义事件)。

比如，对于每次点击按钮都会将计数加一的 `Counter` 组件来说，其测试用例将会模拟点击并断言渲染结果会加 1。该测试并没有关注 `Counter` 如何递增数值，而只关注其输入和输出。

该提议的好处在于，即便该组件的内部实现已经随时间发生了改变，只要你的组件的公共接口始终保持一致，测试就可以通过。

这个话题的细节在 [Matt O'Connell 一份非常棒的演讲](https://www.youtube.com/watch?v=OIpfWTThrK8)中有更多的讨论。

### 浅渲染

在测试用例中，我们通常希望专注在一个孤立的单元中测试组件，避免对其子组件的行为进行间接的断言。

额外的，对于包含许多子组件的组件来说，整个渲染树可能会非常大。重复渲染所有的子组件可能会让我们的测试变慢。

Vue Test Utils 允许你通过 `shallowMount` 方法只挂载一个组件而不渲染其子组件 (即保留它们的存根)：

```js
import { shallowMount } from '@vue/test-utils'

const wrapper = shallowMount(Component)
wrapper.vm // 挂载的 Vue 实例
```

### 生命周期钩子

<div class="vueschool" style="margin-top:1em;"><a href="https://vueschool.io/lessons/learn-how-to-test-vuejs-lifecycle-methods?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to use Vue Test Utils to test Vue.js Lifecycle Hooks with Vue School">在 Vue School 学习如何测试生命周期方法及其区间</a></div>

在使用 `mount` 或 `shallowMount` 方法时，你可以期望你的组件响应 Vue 所有生命周期事件。但是请务必注意的是，除非使用 `Wrapper.destory()`，否则 `beforeDestroy` 和 `destroyed` _将不会触发_。

此外组件在每个测试规范结束时并不会被自动销毁，并且将由用户来决定是否要存根或手动清理那些在测试规范结束前继续运行的任务 (例如 `setInterval` 或者 `setTimeout`)。

### 使用 `nextTick` 编写异步测试代码 (新)

默认情况下 Vue 会异步地批量执行更新 (在下一轮 tick)，以避免不必要的 DOM 重绘或者是观察者计算 ([查看文档](https://cn.vuejs.org/v2/guide/reactivity.html#异步更新队列) 了解更多信息)。

这意味着你在更新会引发 DOM 变化的属性后**必须**等待一下。你可以使用 `Vue.nextTick()`：

```js
it('updates text', async () => {
  const wrapper = mount(Component)
  await wrapper.trigger('click')
  expect(wrapper.text()).toContain('updated')
  await wrapper.trigger('click')
  wrapper.text().toContain('some different text')
})

// 或者你不希望使用 async/await
it('render text', done => {
  const wrapper = mount(TestComponent)
  wrapper.trigger('click').then(() => {
    wrapper.text().toContain('updated')
    wrapper.trigger('click').then(() => {
      wrapper.text().toContain('some different text')
      done()
    })
  })
})
```

可以在[测试异步行为](../guides/README.md#测试异步行为)了解更多。


### 断言触发的事件

每个挂载的包裹器都会通过其背后的 Vue 实例自动记录所有被触发的事件。你可以用 `wrapper.emitted()` 方法取回这些事件记录。

```js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` 返回以下对象：
{
  foo: [[], [123]]
}
*/
```

然后你可以基于这些数据来设置断言：

```js
// 断言事件已经被触发
expect(wrapper.emitted().foo).toBeTruthy()

// 断言事件的数量
expect(wrapper.emitted().foo.length).toBe(2)

// 断言事件的有效数据
expect(wrapper.emitted().foo[1]).toEqual([123])
```

你也可以调用 [`wrapper.emittedByOrder()`](../api/wrapper/emittedByOrder.md) 获取一个按触发先后排序的事件数组。

### 从子组件触发事件

你可以通过访问子组件实例来触发一个自定义事件

**待测试的组件**

```html
<template>
  <div>
    <child-component @custom="onCustom" />
    <p v-if="emitted">Emitted!</p>
  </div>
</template>

<script>
  import ChildComponent from './ChildComponent'

  export default {
    name: 'ParentComponent',
    components: { ChildComponent },
    data() {
      return {
        emitted: false
      }
    },
    methods: {
      onCustom() {
        this.emitted = true
      }
    }
  }
</script>
```

**测试代码**

```js
import { mount } from '@vue/test-utils'
import ParentComponent from '@/components/ParentComponent'
import ChildComponent from '@/components/ChildComponent'

describe('ParentComponent', () => {
  it("displays 'Emitted!' when custom event is emitted", () => {
    const wrapper = mount(ParentComponent)
    wrapper.find(ChildComponent).vm.$emit('custom')
    expect(wrapper.html()).toContain('Emitted!')
  })
})
```

### 操作组件状态

你可以在包裹器上用 `setData` 或 `setProps` 方法直接操作组件状态：

```js
wrapper.setData({ count: 10 })

wrapper.setProps({ foo: 'bar' })
```

### 仿造 Prop

你可以使用 Vue 在内置 `propsData` 选项向组件传入 prop：

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

你也可以用 `wrapper.setProps({})` 方法更新这些已经挂载的组件的 prop：

_想查阅所有选项的完整列表，请移步该文档的[挂载选项](../api/options.md)章节。_

### 仿造 Transitions

尽管在大多数情况下使用 `await Vue.nextTick()` 效果很好，但是在某些情况下还需要一些额外的工作。这些问题将在 `vue-test-utils` 移出 beta 版本之前解决。其中一个例子是 Vue 提供的带有 `<transition>` 包装器的单元测试组件。

```vue
<template>
  <div>
    <transition>
      <p v-if="show">Foo</p>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  }
}
</script>
```

您可能想编写一个测试用例来验证是否显示了文本 Foo ，在将 `show` 设置为 `false` 时，不再显示文本 Foo。测试用例可以这么写：

```js
test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo)
  expect(wrapper.text()).toMatch(/Foo/)

  wrapper.setData({
    show: false
  })
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

实际上，尽管我们调用了 `setData` 方法，然后等待 `nextTick` 来确保 DOM 被更新，但是该测试用例仍然失败了。这是一个已知的问题，与 Vue 中 `<transition>` 组件的实现有关，我们希望在 1.0 版之前解决该问题。在目前情况下，有一些解决方案：

#### 使用 `transitionStub`

```js
const transitionStub = () => ({
  render: function(h) {
    return this.$options._renderChildren
  }
})

test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo, {
    stubs: {
      transition: transitionStub()
    }
  })
  expect(wrapper.text()).toMatch(/Foo/)

  wrapper.setData({
    show: false
  })
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

上面的代码重写了 `<transition>` 组件的默认行为，并在在条件发生变化时立即呈现子元素。这与 Vue 中 `<transition>` 组件应用 CSS 类的实现是相反的。

#### 避免 `setData`

另一种选择是通过编写两个测试来简单地避免使用 `setData`，这要求我们在使用 `mount` 或者 `shallowMount` 时需要指定一些选项：

```js
test('should render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: true
      }
    }
  })

  expect(wrapper.text()).toMatch(/Foo/)
})

test('should not render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: false
      }
    }
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

### 应用全局的插件和混入

有些组件可能依赖一个全局插件或混入 (mixin) 的功能注入，比如 `vuex` 和 `vue-router`。

如果你在为一个特定的应用撰写组件，你可以在你的测试入口处一次性设置相同的全局插件和混入。但是有些情况下，比如测试一个可能会跨越不同应用共享的普通的组件套件的时候，最好还是在一个更加隔离的设置中测试你的组件，不对全局的 `Vue` 构造函数注入任何东西。我们可以使用 [`createLocalVue`](../api/createLocalVue.md) 方法来存档它们：

```js
import { createLocalVue, mount } from '@vue/test-utils'

// 创建一个扩展的 `Vue` 构造函数
const localVue = createLocalVue()

// 正常安装插件
localVue.use(MyPlugin)

// 在挂载选项中传入 `localVue`
mount(Component, {
  localVue
})
```

**注意有些插件会为全局的 Vue 构造函数添加只读属性，比如 Vue Router。这使得我们无法在一个 `localVue` 构造函数上二次安装该插件，或伪造这些只读属性。**

### 仿造注入

另一个注入 prop 的策略就是简单的仿造它们。你可以使用 `mocks` 选项：

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    // 在挂载组件之前
    // 添加仿造的 `$route` 对象到 Vue 实例中
    $route
  }
})
```

### 存根组件

你可以使用 `stubs` 选项覆写全局或局部注册的组件：

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  // 将会把 globally-registered-component 解析为
  // 空的存根
  stubs: ['globally-registered-component']
})
```

### 处理路由

因为路由需要在应用的全局结构中进行定义，且引入了很多组件，所以最好集成到 end-to-end 测试。对于依赖 `vue-router` 功能的独立的组件来说，你可以使用上面提到的技术仿造它们。

### 探测样式

当你的测试运行在 `jsdom` 中时，只能探测到内联样式。
