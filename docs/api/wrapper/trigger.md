## trigger

Triggers an event on the `Wrapper` DOM node.

`trigger` takes an optional `options` object. The properties in the `options` object are added to the Event.

- **Arguments:**

  - `{string} eventType` **required**
  - `{Object} options` **optional**

- **Example:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

wrapper.trigger('click')

wrapper.trigger('click', {
  button: 0
})

wrapper.trigger('click', {
  ctrlKey: true // For testing @click.ctrl handlers
})

expect(clickHandler.called).toBe(true)
```

- **Setting the event target:**

Under the hood, `trigger` creates an `Event` object and dispatches the event on the Wrapper element.

It's not possible to edit the `target` value of an `Event` object, so you can't set `target` in the options object.

To add an attribute to the `target`, you need to set the value of the Wrapper element before calling `trigger`. You can do this with the `element` property.

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
