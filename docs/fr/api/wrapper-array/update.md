# update()

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Force root Vue component of each `Wrapper` in `WrapperArray` to re-render.</p>

If called on a Vue component wrapper array, it will force each Vue component to re-render.

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.at(0).vm.bar).toBe('bar')
divArray.at(0).vm.bar = 'new value'
divArray.update()
expect(divArray.at(0).vm.bar).toBe('new value')
```
