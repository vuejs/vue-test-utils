## createLocalVue()

- **引数:**

  - `{Object} options`
    - `{Function} errorHandler`

- **戻り値:**

  - `{Component}`

- **使い方:**

`createLocalVue` は、グローバル Vue クラスを汚染することなくコンポーネント、ミックスイン、プラグインを追加するための Vue クラスを返します。

[errorHandler](https://jp.vuejs.org/v2/api/index.html#errorHandler)オプションを使用すると、コンポーネントのレンダー機能とウォッチャー中にキャッチされなかったエラーを処理できます。

`options.localVue` と一緒に使用してください。

**オプションなし:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallowMount(Foo, {
  localVue,
  intercept: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallowMount(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

**[errorHandler](https://jp.vuejs.org/v2/api/index.html#errorHandler)オプションを使用:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const errorHandler = (err, vm, info) => {
  expect(err).toBeInstanceOf(Error)
}

const localVue = createLocalVue({
  errorHandler
})

// Fooがライフサイクルフック内でエラーをスローする
const wrapper = shallowMount(Foo, {
  localVue
})
```

- **参照:** [一般的なヒント](../guides/common-tips.md#グローバルプラグインとミックスインの適用)
