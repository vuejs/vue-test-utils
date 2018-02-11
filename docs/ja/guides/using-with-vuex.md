# Vuex と一緒に使用する

このガイドでは、`vue-test-utils` でコンポーネントで Vuex をテストする方法について、見ていきます。

## コンポーネント内の Vuex のテスト

### アクションのモック

それではいくつかのコードを見ていきましょう。

これはテストしたいコンポーネントです。これは Vuex のアクションを呼び出します。

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

このテストの目的のために、アクションが何をしているのか、またはストアがどのように見えるかは気にしません。これらのアクションが必要なときに発行されていること、そして期待された値によって発行されていることを知ることが必要です。

これをテストするためには、私たちのコンポーネントを shallow するときに Vue にモックストアを渡す必要があります。

ストアを Vue コンストラクタベースに渡す代わりに、[localVue](../api/options.md#localvue) に渡すことができます。localeVue はグローバルな Vue コンストラクタに影響を与えずに、変更を加えることができるスコープ付き Vue コンストラクタです。

これがどのように見えるか見ていきましょう:

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

  it('calls store action actionInput when input value is input and an input event is fired', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('does not call store action actionInput when input value is not input and an input event is fired', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('calls store action actionClick when button is clicked', () => {
    const wrapper = shallow(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

ここでは何が起こっているでしょうか？まず、Vue に `localVue.use` メソッドを使用して Vuex を使用するように指示しています。これは、単なる `Vue.use` のラッパです。

次に、新しい `Vuex.store` をモックした値で呼び出すことによってモックのストアを作成します。それをアクションに渡すだけです。それが気にしなければならないことの全てだからです。

アクションは、[Jest のモック関数](https://facebook.github.io/jest/docs/en/mock-functions.html)です。これらモック関数は、アクションが呼び出された、または呼び出されていない、かどうかを検証するメソッドを提供します。

アクションのスタブが期待どおりに呼び出されたことを検討することができます。

今、ストアを定義する方法が、あなたには少し異質に見えるかもしれません。

各テストより前にストアをクリーンに保証するために、`beforeEach` を使用しています。`beforeEach` は各テストより前に呼び出される Mocha のフックです。このテストでは、ストア変数に値を再度割り当てています。これをしていない場合は、モック関数は自動的にリセットされる必要があります。また、テストにおいて状態を変更することもできますが、この方法は、後のテストで影響を与えることはないです。

このテストで最も重要なことは、**モック Vuex ストアを作成し、それを vue-test-utils に渡す** ことです。

素晴らしい！今、アクションをモック化できるので、ゲッタのモックについて見ていきましょう。

### ゲッタのモック


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

これは、かなり単純なコンポーネントです。ゲッタによる `clicks` の結果と `inputValue` を描画します。また、これらゲッタが返す値については実際に気にしません。それらの結果が正しく描画されているかだけです。

テストを見てみましょう:

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

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders state.clicks in second p tag', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

このテストはアクションのテストに似ています。各テストの前にモックストアを作成し、`shallow` を呼び出すときにオプションを渡し、そしてモックゲッタから返された値を描画されているのを検証します。

これは素晴らしいですが、もしゲッタが状態の正しい部分を返しているのを確認したい場合はどうしますか？

### モジュールによるモック

[モジュール](https://vuex.vuejs.org/en/modules.html)はストアを管理しやすい塊に分けるために便利です。それらはゲッタもエクスポートします。テストではこれらを使用することができます。

コンポーネントを見てみましょう:

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

1 つのアクションと 1 つのゲッタを含む単純なコンポーネントです。

そしてテストは以下のようになります:

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

  it('calls store action moduleActionClick when button is clicked', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.module.clicks.toString())
  })
})
```


## Vuex ストアのテスト

Vuex ストアをテストする方法が2つあります。1つ目はゲッタとミューテーションとアクションを別々に単体テストする方法です。2つ目はストアを生成してそれをテストする方法です。

Vuex ストアをテストする方法を説明するためにシンプルなカウンターストアを用意します。このストアには `increment` ミューテーションと `counter` ゲッタがあります。

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

### ゲッタとミューテーションとアクションを別々にテストする

ゲッタとミューテーションとアクションはすべて JavaScript の関数です。それらは `vue-test-utils` と Vuex を使用しなくてもテストすることができます。

ゲッタとミューテーションとアクションを別々にテストする利点は単体テストを詳細に記述することができることです。テストが失敗すると、コードの何が原因か正確に知ることができます。欠点は `commit` や `dispatch` のような Vuex の関数のモックが必要なことです。これは不正なモックが原因で単体テストはパスしてプロダクションは失敗する状況を作り出す可能性があります。

mutations.spec.js と getters.spec.js という名前のテストファイルを2つ作成します。

最初に increment ミューテーションをテストします。

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

今度は `evenOrOdd` ゲッタを次の手順でテストします。 `state` モックを作成します。 `state` を引数としてゲッタ関数を実行します。そして、それが正しい値を返したか確認します。

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

### 実行可能なストアのテスト

Vuexストアをテストするもう1つの方法はストアの設定を使って実行可能なストアを生成することです。

実行可能なストアを生成してテストすることの利点は Vuex の関数をモックする必要がない事です。

欠点はテストが失敗した時、問題がある箇所を見つけることが難しいことです。

テストを書いてみましょう。ストアを生成する際は、 Vue のコンストラクタが汚染されることを避けるために `localVue` を使用します。このテストは store-config.js の export を使用してストアを生成します。

```js
// store-config.js

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

ストアをストアの設定から生成する前に `cloneDeep` を使用しています。こうする理由は Vuex はストアを生成するためにオプションオブジェクトを変更するからです。どのテストでも確実に汚染されていないストアを使うために `storeConfig` オブジェクトを複製する必要があります。

## リソース

- [コンポーネントをテストする例](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [ストアをテストする例](https://github.com/eddyerburgh/testing-vuex-store-example)
- [localVue](../api/options.md#localvue)
- [createLocalVue](../api/createLocalVue.md)
