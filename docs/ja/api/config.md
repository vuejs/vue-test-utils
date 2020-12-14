## Config

vue-test-utils にはオプションを定義するための `config` オプションがあります。

### Vue Test Utils Config オプション

#### `stubs`

- 型: `{ [name: string]: Component | boolean | string }`
- デフォルト: `{}`

コンポーネントで使用するスタブはマウンティングオプションの `stubs` で設定します。

マウンティングオプションの `stubs` が配列である場合、`config.stubs` は配列に変換されます。その場合、使用されるスタブは`<${コンポーネント名}-stub>`を返す基本的なコンポーネントになります。

例:

```js
import { config } from '@vue/test-utils'

config.stubs['my-component'] = '<div />'
```

#### `mocks`

- 型: `Object`
- デフォルト: `{}`

`stubs` のように、 `config.mocks` に渡された値はデフォルトで使用されます。マウンティングオプションの `mocks` オブジェクトに渡された値は `config.mocks` で指定された値よりも優先されます。

例:

```js
import { config } from '@vue/test-utils'

config.mocks['$store'] = {
  state: {
    id: 1
  }
}
```

#### `methods`

- 型: `{ [name: string]: Function }`
- デフォルト: `{}`

`config` オブジェクトを使用してデフォルトのメソッドを設定することができます。これは [VeeValidate](https://vee-validate.logaretm.com/) のようなコンポーネントにメソッドを注入するプラグインに役立ちます。`config` にセットした methods はマウンティングオプションに `methods` を渡すことで上書きすることができます。

例:

```js
import { config } from '@vue/test-utils'

config.methods['getData'] = () => {}
```

#### `provide`

- 型: `Object`
- デフォルト: `{}`

`stubs` や  `mocks` のように `config.provide` に渡された値はデフォルトで使用されます。マウンティングオプションの `provide` オブジェクトに渡された値は `config.provide` で指定された値よりも優先されます。 **`config.provide` に関数をセットすることはできないことに注意してください。**

例:

```js
import { config } from '@vue/test-utils'

config.provide['$logger'] = {
  log: (...args) => {
    console.log(...args)
  }
}
```
