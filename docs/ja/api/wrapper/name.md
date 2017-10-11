# name()

`Wrapper`にVueインスタンスが含まれている場合はコンポーネント名を返し、そうでない場合は`Wrapper`のDOMノードのタグ名を返します。

- **戻り値:** `{string}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).to.equal('Foo')
const p = wrapper.find('p')
expect(p.name()).to.equal('p')
```
