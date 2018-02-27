# `createLocalVue()`

- **Returns:**
  - `{Component}`

- **Usage:**

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>`createLocalVue` returns a Vue class for you to add components, mixins and install plugins without polluting the global Vue class.</p>

Use it with `options.localVue`:

```js
import { createLocalVue, shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

- **See also:** [Common Tips](../guides/common-tips.md#applying-global-plugins-and-mixins)
