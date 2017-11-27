# setComputed(computedObjects)

`WrapperArray` の `Wrapper` ごとに `Wrapper` `vm` の computed プロパティを設定し、更新を強制します。

**すべての Wrapper には Vue インスタンスを含む必要があることに注意してください**
**`setComputed` に渡す computed プロパティはすべての Vue インスタンスに存在する必要があることに注意してください**

- **引数:**
  - `{Object} computed properties`

- **例:**

```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})
```
