## trigger

Déclenche un [event](../../guides/dom-events.md#trigger-events) sur chaque `Wrapper` dans le nœud DOM `WrapperArray`.

**Note chaque `Wrapper` doit contenir une instance de Vue.**

- **Arguments:**

  - `{string} eventType` **required**
  - `{Object} options` **optional**

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

const divArray = wrapper.findAll('div')
divArray.trigger('click')
expect(clickHandler.called).toBe(true)
```
