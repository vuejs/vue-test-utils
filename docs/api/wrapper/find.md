## find

Returns `Wrapper` of first DOM node or Vue component matching selector.

Use any valid [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.is('div')).toBe(true)

const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)

const barByName = wrapper.find({ name: 'bar' })
expect(barByName.is(Bar)).toBe(true)

const fooRef = wrapper.find({ ref: 'foo' })
expect(fooRef.is(Foo)).toBe(true)
```

- **Note:**

  - When chaining `find` calls together, only DOM selectors can be used

```js
let button

// Will throw an error
button = wrapper.find({ ref: 'testButton' })
expect(button.find(Icon).exists()).toBe(true)

// Will throw an error
button = wrapper.find({ ref: 'testButton' })
expect(button.find({ name: 'icon' }).exists()).toBe(true)

// Will work as expected
button = wrapper.find({ ref: 'testButton' })
expect(button.find('.icon').exists()).toBe(true)
```

See also: [get](./get.md).
