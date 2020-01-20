## createWrapper(node [, options])

- **引数:**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} attachedToDocument`

- **戻り値:**

  - `{Wrapper}`

- **使い方:**

`createWrapper` は Vue インスタンスまたは HTML 要素に対する `Wrapper` を生成します。

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
