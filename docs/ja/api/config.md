# config

vue-test-utils にはオプションを定義するための `config` オプションがあります。

## `vue-test-utils` `config` オプション

### `stubs`

- 型: `Object`
- デフォルト: `{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

コンポーネントで使用するスタブはマウンティングオプションの `stubs` で設定します。

マウンティングオプションの `stubs` が配列である場合、`config.stubs` は配列に変換されます。その場合、使用されるスタブは`<!---->`を返す基本的なコンポーネントになります。

例:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['my-component'] = '<div />'
```
