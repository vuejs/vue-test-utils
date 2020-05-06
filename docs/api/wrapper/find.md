## find

Returns `Wrapper` of first DOM node or Vue component matching selector.

Use any valid DOM selector (uses `querySelector` syntax).

- **Arguments:**

  - `{string} selector`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.exists()).toBe(true)

const byId = wrapper.find('#bar')
expect(byId.element.id).toBe('bar')
```

- **Note:**

  - You may chain `find` calls together:

```js
const button = wrapper.find({ ref: 'testButton' })
expect(button.find('.icon').exists()).toBe(true)
```

See also: [get](./get.md).
