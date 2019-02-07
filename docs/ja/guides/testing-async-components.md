## 非同期動作のテスト

テストをシンプルにするために、 `vue-test-utils` は DOM の更新を同期的に適用します。しかし、コールバックや Promise のようなコンポーネントの非同期動作をテストする場合、いくつかのテクニックを知っておく必要があります。

よくある非同期動作の 1 つとして API 呼び出しと Vuex の action があります。以下の例は API 呼び出しをするメソッドをテストする方法を示しています。この例は HTTP のライブラリである `axios` をモックしてテストを実行するために Jest を使っています。Jest のモックの詳細は[ここ](https://jestjs.io/docs/en/manual-mocks.html#content)にあります。

`axios` のモックの実装はこのようにします。

```js
export default {
  get: () => Promise.resolve({ data: 'value' })
}
```

ボタンをクリックすると以下のコンポーネントは API 呼び出しをします。そして、レスポンスを `value` に代入します。

```html
<template>
  <button @click="fetchResults" />
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

テストはこのように書くことができます。

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  expect(wrapper.vm.value).toBe('value')
})
```

`fetchResults` 内の Promise が resolve する前にアサーションが呼ばれるので、このテストは現時点では失敗します。ほとんどのユニットテストライブラリはテストが完了したことをテストランナーに知らせるためのコールバック関数を提供します。Jest と Mocha は両方とも  `done` を使います。アサーションが行われる前に確実に各 Promise が resolve するために `done` を `$nextTick` や  `setTimeout` と組み合わせて使うことができます。

```js
it('fetches async when a button is clicked', done => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  wrapper.vm.$nextTick(() => {
    expect(wrapper.vm.value).toBe('value')
    done()
  })
})
```

`$nextTick` と  `setTimeout` がテストをパスする理由は `$nextTick` と  `setTimeout` を処理するタスクキュー前に Promise のコールバック関数を処理するマイクロタスクキューが実行されるからです。つまり、`$nextTick` と  `setTimeout` が実行される前に、マイクロタスクキュー上にあるすべての Promise のコールバック関数が実行されます。より詳しい説明は[ここ](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)を見てください。

もう 1 つの解決策は `async` function と npm パッケージの `flush-promises` を使用することです。`flush-promises` は堰き止められている resolve された Promise ハンドラを流します。堰き止められている Promise を流すこととテストの可読性を改善するために `await` を `flushPromises` の呼び出しの前に置きます。

反映されたテストはこのようになります。

```js
import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', async () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.vm.value).toBe('value')
})
```

同じテクニックをデフォルトで Promise を返す Vuex の action に適用することができます。
