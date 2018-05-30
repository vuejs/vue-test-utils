## Selectors

A lot of methods take a selector as an argument. A selector can either be a CSS selector, a Vue component, or a find option object.

### CSS Selectors

Mount handles any valid CSS selector:

- tag selectors (`div`, `foo`, `bar`)
- class selectors (`.foo`, `.bar`)
- attribute selectors (`[foo]`, `[foo="bar"]`)
- id selectors (`#foo`, `#bar`)
- pseudo selectors (`div:first-of-type`)

You can also use combinators:

- direct descendant combinator (`div > #bar > .foo`)
- general descendant combinator (`div #bar .foo`)
- adjacent sibling selector (`div + .foo`)
- general sibling selector (`div ~ .foo`)

### Vue Components

Vue components are also valid selectors.

```js
// Foo.vue

export default {
  name: 'FooComponent'
}
```

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
expect(wrapper.is(Foo)).toBe(true)
```

### Find Option Object

#### Name

Using a find option object, Vue Test Utils allows for selecting elements by a `name` of component on wrapper components.

```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

#### Ref

Using a find option object, Vue Test Utils allows for selecting elements by `$ref` on wrapper components.

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
