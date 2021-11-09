## findComponent

Returns `Wrapper` of first matching Vue component.

- **Arguments:**

  - `{Component|ref|string} selector`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const bar = wrapper.findComponent(Bar) // => finds Bar by component instance
expect(bar.exists()).toBe(true)
const barByName = wrapper.findComponent({ name: 'bar' }) // => finds Bar by `name`
expect(barByName.exists()).toBe(true)
const barRef = wrapper.findComponent({ ref: 'bar' }) // => finds Bar by `ref`
expect(barRef.exists()).toBe(true)
```

::: warning Usage with CSS selectors
Using `findAllComponents` with CSS selector might have confusing behavior

Consider this example:

```js
const ChildComponent = {
  name: 'Child',
  template: '<div class="child"></div>'
}

const RootComponent = {
  name: 'Root',
  components: { ChildComponent },
  template: '<child-component class="root" />'
}

const wrapper = mount(RootComponent)

const rootByCss = wrapper.findComponent('.root') // => finds Root
expect(rootByCss.vm.$options.name).toBe('Root')
const childByCss = wrapper.findComponent('.child')
expect(childByCss.vm.$options.name).toBe('Root') // => still Root
```

The reason for such behavior is that `RootComponent` and `ChildComponent` are sharing same DOM node and only first matching component is included for each unique DOM node
:::
