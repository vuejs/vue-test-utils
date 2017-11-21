# setComputed(computedProperties)

`Wrapper` `vm` の computed プロパティを設定し、更新を強制します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**
**`setComputed`に渡す computed プロパティは Vue インスタンスに存在する必要があることに注意してください**


- **引数:**
- `{Object} computed プロパティ`

- **例:**

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
