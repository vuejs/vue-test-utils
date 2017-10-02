# hasProp(prop, value)

Wrapper配列内の各Wrappervmにプロパティとマッチしているかアサートします。

Vueインスタンスのみ呼び出せます。

# hasProp(prop, value)

- **引数:**
  - `{string} prop`
  - `{any} value`

- **戻り値:** `{boolean}`

- **使い方:**

`WrappersArray`の`Wrapper`と`vm`にプロパティを持っているかアサートします。

**Note the Wrapper must contain a Vue instance.**
**WrapperにはVueインスタンスを含む必要があることに注意してください。**


```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).to.equal(true)
```
