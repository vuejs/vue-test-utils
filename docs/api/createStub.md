## createStub()

- **Arguments:**

  - `{String} name`

- **Returns:**
  - `{Component}`

- **Usage:**

Creates a stub component. Useful when combined with [`find`](wrapper/find)  and [`findAll`](wrapper/findAll).

```js
import { shallowMount, createStub } from '@vue/test-utils'
import ComponentWithChild from './ComponentWithChild.vue'

describe('ComponentWithChild', () => {
  it('renders a child component', () => {
    const Child = createStub('Child')
    const wrapper = shallowMount(ComponentWithChild, {
      stubs: {
        Child: Child
      }
    })
    expect(wrapper.findAll(Child).length).toBe(1)
  })
})
```

Where `Child` is a component with `name: 'Child'`.
