# Селекторы

Многие методы принимают селектор в качестве аргумента. Селектором может быть CSS селектор или компонент Vue.

## CSS селекторы

обрабатывают любой допустимый CSS селектор:

- селекторы тегов (div, foo, bar)
- селекторы классов (.foo, .bar)
- селекторы атрибутов ([foo], [foo="bar"])
- селекторы id (#foo, #bar)
- селекторы псевдо-элементов (div:first-of-type)

Вы также можете использовать комбинации:

- direct descendant combinator (div > #bar > .foo)
- general descendant combinator (div #bar .foo)
- adjacent sibling selector (div + .foo)
- general sibling selector (div ~ .foo)

## Компоненты Vue

Компоненты Vue также являются допустимыми селекторами.

vue-test-utils использует свойство `name` для поиска экземпляра в дереве компонентов, соответствующих компоненту Vue.

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
