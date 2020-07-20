## setMethods(methods)

::: warning Deprecation warning
`setMethods` は非推奨となり、将来のリリースで削除される予定です。

`setMethods` を置き換える明確な方法はありません。それは、置き換え前の使われ方に非常に依存しているためです。 `setMethods` は実装の詳細に依存する不安定なテストに簡単につながるため、[お勧めしません](https://github.com/vuejs/rfcs/blob/668866fa71d70322f6a7689e88554ab27d349f9c/active-rfcs/0000-vtu-api.md#setmethods)。

それらテストを見直すことをお勧めします。

複雑なメソッドをスタブするには、コンポーネントからメソッドを抽出し、単独でテストします。 メソッドが呼び出されたことをアサートするには、テストランナーを使用してそれを探ります。
:::

`WrapperArray` の `Wrapper` ごとに `Wrapper` に `vm` メソッドをセットし、強制的に更新します。

**すべての `Wrapper` は Vue インスタンスを含んでいなければならないことに注意してください。**

- **引数:**

  - `{Object} methods`

- **例:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).toBe(true)
```
