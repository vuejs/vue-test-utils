# `setComputed(computedObjects)`

设置 `Wrapper` `vm` 的计算属性并强制更新。

**注意：该包裹器必须包含一个 Vue 示例。**
**注意：该 Vue 示例必须已经有被传入 `setComputed` 的计算属性。**

- **参数：**
  - `{Object} computed properties`

- **示例：**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount({
  template: '<div>{{ computed1 }} {{ computed2 }}</div>',
  data () {
    return {
      initial: 'initial'
    }
  },
  computed: {
    computed1 () {
      return this.initial
    },
    computed2 () {
      return this.initial
    }
  }
})

expect(wrapper.html()).toBe('<div>initial initial</div>')

wrapper.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})

expect(wrapper.html()).toBe('<div>new-computed1 new-computed2</div>')
```
