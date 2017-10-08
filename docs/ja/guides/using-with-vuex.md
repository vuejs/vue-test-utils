# Vuexで使う

## Actionsをモックする

いくつかのコードを見てみましょう。

これはテストしたいコンポーネントです。これはVuexの動作を呼び出します。

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

このテストの目的のために、私たちはそのアクションが何をしているのか、あるいはストアがどのように見えるのか気にしません。我々は、これらのアクションが必要なときに発火していること、そして期待された値と発火されたことを知るだけでよいでしょう。

これをテストするには、コンポーネントをマウントするときにモックストアをVueに渡す必要があります。

これがどのように見えるか見てみましょう。:

``` js
import Vue from 'vue'
import { mount } from 'vue-test-utils'
import sinon from 'sinon'
import { expect } from 'chai'
import Vuex from 'vuex'
import 'babel-polyfill'
import Actions from '../../../src/components/Actions'

Vue.use(Vuex)

describe('Actions.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: sinon.stub(),
      actionInput: sinon.stub()
    }
    store = new Vuex.Store({
      state: {},
      actions
    })
  })

  it('calls store action actionInput when input value is input and an input even is fired', () => {
    const wrapper = mount(Actions, { store })
    const input = wrapper.find('input')[0]
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput.calledOnce).toBe(true)
  })

  it('does not call store action actionInput when input value is not input and an input even is fired', () => {
    const wrapper = mount(Actions, { store })
    const input = wrapper.find('input')[0]
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput.calledOnce).toBe(false)
  })

  it('calls store action actionClick when button is clicked', () => {
    const wrapper = mount(Actions, { store })
    wrapper.find('button')[0].trigger('click')
    expect(actions.actionClick.calledOnce).toBe(true)
  })
})
```

ここで何が起こっていますか？まず、VueにVue.useメソッドを使用するように指示します。これは単なるVue.useのラッパです。

次に、新しいVuex.storeをモック値で呼び出すことによってモックストアを作成します。それは私たちが気にかけていることなので、アクションだけを渡します。

アクションは[sinon stubs](http://sinonjs.org/)です。スタブは、アクションが呼び出されたかどうかをアサートするメソッドを提供します。

私たちはテストで、アクションスタブが期待どおりに呼び出されたことを検証することができます。

今私たちがstoreを定義する方法はあなたには少し不明に見えるかもしれません。

beforeEachを使用して、各テストの前にstoreを確実に清潔にしています。beforeEachは各テストの前に呼び出されるmocha hookです。テストでは、ストア変数の値を再割り当てしています。これをやっていなければ、sinonスタブを自動的にリセットする必要があります。また、後のテストに影響を与えることなく、テストの状態を変更することもできます。

このテストで最も重要なのは**Vuexストアのモックを作成し、それをvue-test-utilsに渡すことです**。

素晴らしい、偉大なので、我々はアクションを模擬することができます、ゲッターをモックで見てみましょう。

## Getter をモックする


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

これはかなり単純な要素です。 getterのクリックとinputValueの結果をレンダリングします。ここでも、ゲッターが返すものについては実際には気にしません。その結果が正しく表示されているだけです。

テストを見てみましょう:

``` js
import 'babel-polyfill'
import Vue from 'vue'
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Vuex from 'vuex'
import Actions from '../../../src/components/Getters'

Vue.use(Vuex)

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
    const wrapper = mount(Actions, { store })
    const p = wrapper.find('p')[0]
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders state.clicks in second p tag', () => {
    const wrapper = mount(Actions, { store })
    const p = wrapper.find('p')[1]
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```
このテストは、私たちのアクションテストに似ています。各テストの前にモックストアを作成し、マウントを呼び出すときにオプションとして渡し、モックゲッターから返された値がレンダリングされていることを検証します。

これは素晴らしいことですが、getterが私たちの状態を正しく返していることを確認したいのですが？

## モジュールによるモッキング

[モジュール](https://vuex.vuejs.org/ja/modules.html) は、私たちのストアを管理しやすい塊に分けるのに便利です。彼らはゲッターもエクスポートします。テストではこれらを使用できます。

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
1つのアクションと1つのゲッターを含むシンプルなコンポーネント。

そしてテスト:

``` js
import Vue from 'vue'
import { mount } from 'vue-test-utils'
import sinon from 'sinon'
import { expect } from 'chai'
import Vuex from 'vuex'
import 'babel-polyfill'
import Modules from '../../../src/components/Modules'
import module from '../../../src/store/module'

Vue.use(Vuex)

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
      moduleActionClick: sinon.stub()
    }

    store = new Vuex.Store({
      state,
      actions,
      getters: module.getters
    })
  })

  it('calls store action moduleActionClick when button is clicked', () => {
    const wrapper = mount(Modules, { store })
    const button = wrapper.find('button')[0]
    button.trigger('click')
    expect(actions.moduleActionClick.calledOnce).toBe(true)
  })

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = mount(Modules, { store })
    const p = wrapper.find('p')[0]
    expect(p.text()).toBe(state.module.clicks.toString())
  })
})
```

モジュールファイルの外観を見るには [リポジトリ](https://github.com/eddyerburgh/mock-vuex-in-vue-unit-tests-tutorial)を参照してください。
