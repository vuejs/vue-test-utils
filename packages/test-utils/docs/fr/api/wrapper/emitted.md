# emitted()

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Return an object containing custom events emitted by the `Wrapper` `vm`.</p>

- **Returns:** `{ [name: string]: Array<Array<any>> }`

- **Example:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() returns the following object:
{
  foo: [[], [123]]
}
*/

// assert event has been emitted
expect(wrapper.emitted().foo).toBeTruthy()

// assert event count
expect(wrapper.emitted().foo.length).toBe(2)

// assert event payload
expect(wrapper.emitted().foo[1]).toEqual([123])
```

You can also write the above as follows:

```js
// assert event has been emitted
expect(wrapper.emitted('foo')).toBeTruthy()

// assert event count
expect(wrapper.emitted('foo').length).toBe(2)

// assert event payload
expect(wrapper.emitted('foo')[1]).toEqual([123])
```
