# 配合 Vuex 使用

在本教程中，我们将会看到如何用 `vue-test-utils` 测试组件中的 Vuex，以及如何测试一个 Vuex store。

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

站在测试的角度，我们不关心这个 action 做了什么或者这个 store 是什么样子的。我们只需要知道这些 action 将会在适当的时机触发，已经它们触发时的预期值。

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

该测试中最重要的注意事项是：**我们创建了一个伪造的 Vuex store 并将其传递给 `vue-test-utils`**。

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

## 伪造 Module

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

## Testing a Vuex Store

There are two approaches to testing a Vuex store. The first approach is to unit test the getters, mutations, and actions separately. The second approach is to create a store and test against that. We'll look at both approaches.

To see how to test a Vuex store, we're going to create a simple counter store. The store will have an `increment` mutation and a `counter` getter.

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

### Testing getters, mutations, and actions separately

Getters, mutations, and actions are all JavaScript functions, so we can test them without using `vue-test-utils` or Vuex.

The benefit to testing getters, mutations, and actions separately is that your unit tests are detailed. When they fail, you know exactly what is wrong with your code. The downside is that you will need to mock Vuex funtions, like `commit` and `dispatch`. This can lead to a situation where your unit tests pass, but your production code fails because your mocks are incorrect.

We'll create two test files, mutations.spec.js and getters.spec.js:

First, let's test the `increment` mutations:

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

Now let's test the `evenOrOdd` getter. We can test it by creating a mock `state`, calling the getter with the `state` and checking it returns the correct value.

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

### Testing a running store

Anopther approach to testing a Vuex store is to create a running store using the store config.

The benefit of testing creating a running store instance is we don't have to mock any Vuex functions.

The downside is that when a test breaks, it can be difficult to find where the problem is.

Let's write a test. When we create a store, we'll use `localVue` to avoid polluting the Vue base constructor. The test creates a store using the store-config.js export:

```js
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
// store-config.spec.js

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

Notice that we use `cloneDeep` to clone the store config before creating a store with it. This is because Vuex mutates the options object used to create the store. To make sure we have a clean store in each test, we need to clone the `storeConfig` object.

### 相关资料

- [Example project for testing the components](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [Example project for testing the store](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)

