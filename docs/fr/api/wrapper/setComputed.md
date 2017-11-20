# setComputed(computedProperties)

Sets `Wrapper` `vm` computed property and forces update.

**Note the Wrapper must contain a Vue instance.**
**Note the Vue instance must already have the computed properties passed to `setComputed`.**


- **Arguments:**
  - `{Object} computed properties`

- **Example:**

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
