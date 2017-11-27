# TransitionStub

`transition` コンポーネントをスタブするためのコンポーネントです。これはトランジションを非同期で実行する代わりに、子コンポーネントを同期的に返します。

デフォルトではすべての `transition` コンポーネントは `TransitionStub` でスタブされます。これは `vue-test-utils` の `config` で設定されています。スタブせずに既存の `transition` コンポーネントを使用したい場合は、 `config.stubs['transition']` に `false` をセットします。:

```js
import VueTestUtils from 'vue-test-utils'

VueTestUtils.config.stubs.transition = false
```

`transition` コンポーネントをスタブするために再びセットするには以下のようにします。

```js
import VueTestUtils, { TransitionStub } from 'vue-test-utils'

VueTestUtils.config.stubs.transition = TransitionStub
```

マウンティングオプションでスタブとしてセットするには以下のようにします。

```js
import { mount, TransitionStub } from 'vue-test-utils'

mount(Component, {
  stubs: {
    transition: TransitionStub
  }
})
```
