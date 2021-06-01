## trigger

Triggers an event asynchronously on the `Wrapper` DOM node.

`trigger` takes an optional `options` object. The properties in the `options` object are added to the Event.
`trigger` returns a Promise, which when resolved, guarantees the component is updated.
`trigger` only works with native DOM events. To emit a custom event, use `wrapper.vm.$emit('myCustomEvent')`

- **Arguments:**

  - `{string} eventType` **required**
  - `{Object} options` **optional**

- **Example:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  await wrapper.trigger('click')

  await wrapper.trigger('click', {
    button: 0
  })

  await wrapper.trigger('click', {
    ctrlKey: true // For testing @click.ctrl handlers
  })

  expect(clickHandler.called).toBe(true)
})
```

::: tip
When using `trigger('focus')` with [jsdom v16.4.0](https://github.com/jsdom/jsdom/releases/tag/16.4.0) and above you must use the [attachTo](../options.md#attachto) option when mounting the component. This is because a bug fix in [jsdom v16.4.0](https://github.com/jsdom/jsdom/releases/tag/16.4.0) changed `el.focus()` to do nothing on elements that are disconnected from the DOM.
:::

- **Setting the event target:**

Under the hood, `trigger` creates an `Event` object and dispatches the event on the Wrapper element.

It's not possible to edit the `target` value of an `Event` object, so you can't set `target` in the options object.

To add an attribute to the `target`, you need to set the value of the Wrapper element before calling `trigger`. You can do this with the `element` property.

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
