## Selector

Rất nhiều phương thức nhận selector như một tham số. Một selector có thể là CSS selector, một Vue component, hoặc object muốn tìm.

### CSS Selector

Mount sẽ xử tất cả những CSS selector hợp lệ:

- tag selectors (`div`, `foo`, `bar`)
- class selectors (`.foo`, `.bar`)
- attribute selectors (`[foo]`, `[foo="bar"]`)
- id selectors (`#foo`, `#bar`)
- pseudo selectors (`div:first-of-type`)

Có thể sử dụng combinator:

- direct descendant combinator (`div > #bar > .foo`)
- general descendant combinator (`div #bar .foo`)
- adjacent sibling selector (`div + .foo`)
- general sibling selector (`div ~ .foo`)

### Vue Component

Vue component cũng có thể là một selector

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

### Object dùng để tìm

#### Name

Sử dụng một object để tìm, Vue Test Utils cho phép chọn một element bằng `name` của component trong wrapper.

```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

#### Ref

Sử dụng một object để tìm, Vue Test Utils cho phép chọn element bằng `$ref` trong wrapper.

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
