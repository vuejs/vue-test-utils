# filter(predicate)

`Wrapper` オブジェクトを判別する関数を使用して `WrapperArray` をフィルタリングします。

このメソッドの動作は [Array.prototype.filter](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) に似ています。

- **引数:**
  - `{function} predicate`

- **戻り値:** `{WrapperArray}`

predicate 関数が true を返す `Wrapper` インスタンスを含む新しい `WrapperArray` インスタンスを返します。

- **例:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const filteredDivArray = wrapper.findAll('div').filter(w => !w.hasClass('filtered'))
```
