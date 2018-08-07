## TransitionGroupStub

`transition-group` コンポーネントをスタブするためのコンポーネントです。これはトランジションを非同期で実行する代わりに、子コンポーネントを同期的に返します。

デフォルトではすべての `transition-group` コンポーネントは `TransitionGroupStub` でスタブされます。これは `vue-test-utils` の `config` で設定されています。スタブせずに既存の `transition-group` コンポーネントを使用したい場合は、 `config.stubs['transition-group']` に `false` をセットします。:

```js
import { config } from '@vue/test-utils'

config.stubs['transition-group'] = false
```

`transition-group` コンポーネントをスタブするために再びセットするには以下のようにします。

```js
import { config, TransitionGroupStub } from '@vue/test-utils'

config.stubs['transition-group'] = TransitionGroupStub
```

マウンティングオプションでスタブとしてセットするには以下のようにします。

```js
import { mount, TransitionGroupStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```
