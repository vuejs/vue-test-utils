# 配合 Vuex 使用

在本教程中，我们将会看到如何用 Vue Test Utils 测试组件中的 Vuex，以及如何测试一个 Vuex store。

## 在组件中测试 Vuex

### 伪造 Action

我们来看一些代码。

这是我们想要测试的组件。它会调用 Vuex action。

``` html
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Click</button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'actionClick'
    ]),
    actionInputIfTrue: function actionInputIfTrue (event) {
      const inputValue = event.target.value
      if (inputValue === 'input') {
        this.$store.dispatch('actionInput', { inputValue })
      }
    }
  }
}
</script>
```

站在测试的角度，我们不关心这个 action 做了什么或者这个 store 是什么样子的。我们只需要知道这些 action 将会在适当的时机触发，以及它们触发时的预期值。

为了完成这个测试，我们需要在浅渲染组件时给 Vue 传递一个伪造的 store。

我们可以把 store 传递给一个 [`localVue`](../api/options.md#localvue)，而不是传递给基础的 Vue 构造函数。`localVue` 是一个独立作用域的 Vue 构造函数，我们可以对其进行改动而不会影响到全局的 Vue 构造函数。

我们来看看它的样子：

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Actions.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      actions
    })
  })

  it('当输入框的值是“input”且一个“input”事件被触发时会调用“actionInput”的 action', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('当输入框的值不是“input”但有“input”事件触发时不会掉用“actionInput”的 action', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('当按钮被点击时候调用“actionClick”的 action', () => {
    const wrapper = shallow(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

这里发生了什么？首先我们用 `localVue.use` 方法告诉 Vue 使用 Vuex。这只是 `Vue.use` 的一个包裹器。

然后我们用 `new Vuex.store` 伪造了一个 store 并填入假数据。我们只把它传递给 action，因为我们只关心这个。

该 action 是 [Jest 伪造函数](https://facebook.github.io/jest/docs/en/mock-functions.html)。这些伪造函数让我们去断言该 action 是否被调用。

然后我们可以在我们的测试中断言 action 存根是否如预期般被调用。

现在我们定义 store 的方式在你看来可能有点特别。

我们使用 `beforeEach` 来确认我们在每项测试之前已经拥有一个干净的 store。`beforeEach` 是一个 mocha 的钩子，会在每项测试之前被调用。我们在测试中会重新为 store 的变量赋值。如果我们没有这样做，伪造函数就需要被自动重置。它还需要我们改变测试中的 state，而不会影响后面的其它测试。

该测试中最重要的注意事项是：**我们创建了一个伪造的 Vuex store 并将其传递给 Vue Test Utils**。

好的，现在我们可以伪造 action 了，我们再来看看伪造 getter。

## 伪造 Getter


``` html
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default{
  computed: mapGetters([
    'clicks',
    'inputValue'
  ])
}
</script>
```

这是一个非常简单的组件。它根据 getter `clicks` 和 `inputValue` 渲染结果。还是那句话，我们并不关注这些 getter 返回什么——只关注它们被正确的渲染。

让我们看看这个测试：

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Getters'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Getters.vue', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input'
    }

    store = new Vuex.Store({
      getters
    })
  })

  it('在第一个 p 标签中渲染“state.inputValue”', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('在第二个 p 标签中渲染“state.clicks”', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

这个测试和我们的 action 测试很相似。我们在每个测试运行之前创建了一个伪造的 store，在我们调用 `shallow` 的时候将其以一个选项传递进去，并断言我们伪造的 getter 的返回值被渲染。

这非常好，但是如果我们想要检查我们的 getter 是否返回了正确的 state 的部分该怎么办呢？

### 伪造 Module

[Module](https://vuex.vuejs.org/zh-cn/modules.html) 对于将我们的 store 分隔成多个可管理的块来说非常有用。它们也暴露 getter。我们可以在测试中使用它们。

看看这个组件：

``` html
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'moduleActionClick'
    ])
  },

  computed: mapGetters([
    'moduleClicks'
  ])
}
</script>
```

简单的包含一个 action 和一个 getter 的组件。

其测试：

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Modules from '../../../src/components/Modules'
import module from '../../../src/store/module'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Modules.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      module: {
        clicks: 2
      }
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      state,
      actions,
      getters: module.getters
    })
  })

  it('在点击按钮时调用 action“moduleActionClick”', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('在第一个 p 标签内渲染“state.inputValue”', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.module.clicks.toString())
  })
})
```

## 测试一个 Vuex Store

这里有两个测试 Vuex store 的方式。第一个方式是分别单元化测试 getter、mutation 和 action。第二个方式是创建一个 store 并针对其进行测试。我们接下来看看这两种方式如何。

为了弄清楚如果测试一个 Vuex store，我们会创建一个简单的计数器 store。该 store 会有一个 `increment` mutation 和一个 `counter` getter。

```js
// mutations.js
export default {
  increment (state) {
    state.count++
  }
}

```

```js
// getters.js
export default {
  evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
}
```

### 分别测试 getter、mutation 和 action

Getter、mutation 和 action 全部是 JavaScript 函数，所以我们可以不通过 Vue Test Utils 和 Vuex 测试它们。

分别测试 getter、mutation 和 action 的好处是你的单元测试是非常详细的。当它们失败时，你完全知道你代码的问题是什么。当然另外一方面你需要伪造诸如 `commit` 和 `dispatch` 的 Vuex 函数。这会导致在一些情况下你伪造错了东西，导致单元测试通过，生产环境的代码缺失败了。

我们会创建两个测试文件：`mutations.spec.js` 和 `getters.spec.js`：

首先，我们测试名为 `increment` 的 mutation：

```js
// mutations.spec.js

import mutations from './mutations'

test('increment increments state.count by 1', () => {
  const state = {
    count: 0
  }
  mutations.increment(state)
  expect(state.count).toBe(1)
})
```

现在让我们测试 `evenOrOdd` getter。我们可以通过创建一个伪造的 `state` 来测试它，带上 `state` 调用这个 getter 并检查它是否返回正确的结果。

```js
// getters.spec.js

import getters from './getters'

test('evenOrOdd returns even if state.count is even', () => {
  const state = {
    count: 2
  }
  expect(getters.evenOrOdd(state)).toBe('even')
})

test('evenOrOdd returns odd if state.count is even', () => {
  const state = {
    count: 1
  }
  expect(getters.evenOrOdd(state)).toBe('odd')
})

```

### 测试一个运行中的 store

另一个测试 Vuex store 的方式就是使用 store 配置创建一个运行中的 store。

这样做的好处是我们不需要伪造任何 Vuex 函数。

另一方面当一个测试失败时，排查问题的难度会增加。

我们来写一个测试吧。当我们创建一个 store 时，我们会使用 `localVue` 来避免污染 Vue 的基础构造函数。该测试会使用 `store-config.js` 导出的配置创建一个 store：

```js
// store-config.spec.js
import mutations from './mutations'
import getters from './getters'

export default {
  state: {
    count: 0
  },
  mutations,
  getters
}
```

```js
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import storeConfig from './store-config'
import { cloneDeep } from 'lodash'

test('increments count value when increment is commited', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.state.count).toBe(0)
  store.commit('increment')
  expect(store.state.count).toBe(1)
})

test('updates evenOrOdd getter when increment is commited', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.getters.evenOrOdd).toBe('even')
  store.commit('increment')
  expect(store.getters.evenOrOdd).toBe('odd')
})
```

注意我们在创建一个 store 之前使用了 `cloneDeep` 来克隆 store 配置。这是因为 Vuex 会改变用来创建 store 的选项对象。为了确保我们能为每一个测试都提供一个干净的 store，我们需要克隆 `storeConfig` 对象。

## 相关资料

- [测试组件的示例工程](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [测试 store 的示例工程](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)

