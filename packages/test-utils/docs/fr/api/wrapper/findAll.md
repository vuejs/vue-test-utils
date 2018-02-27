# findAll(selector)

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Returns a [`WrapperArray`](../wrapper-array/README.md) of [Wrappers](README.md).</p>

Use any valid [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{WrapperArray}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).toBe(true)
```

- **See also:** [Wrapper](README.md)
