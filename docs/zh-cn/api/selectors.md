# Selectors

A lot of methods take a selector as an argument. A selector can either be a CSS selector, or a Vue component.

## CSS Selectors

mount handles any valid CSS selector:

- tag selectors (div, foo, bar)
- class selectors (.foo, .bar)
- attribute selectors ([foo], [foo="bar"])
- id selectors (#foo, #bar)
- pseudo selectors (div:first-of-type)

You can also use combinators:

- direct descendant combinator (div > #bar > .foo)
- general descendant combinator (div #bar .foo)
- adjacent sibling selector (div + .foo)
- general sibling selector (div ~ .foo)

## Vue Components

Vue components are also valid selectors.

vue-test-utils uses the `name` property to search the instance tree for matching Vue components.

```js
// Foo.vue

export default{
  name: 'FooComponent'
}
```

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.is(Foo)).toBe(true)
```
