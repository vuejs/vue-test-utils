# text()

- **戻り値:** `{string}`

- **使い方:**

`Wrapper`のテキスト内容を返します。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).to.equal('bar')
```