## Селекторы

Многие методы принимают селектор в качестве аргумента. Селектором может быть CSS селектор, компонент Vue или опция поиска объекта.

### CSS-селекторы

Обрабатывают любой допустимый CSS селектор:

- селекторы тегов (`div`, `foo`, `bar`)
- селекторы классов (`.foo`, `.bar`)
- селекторы атрибутов (`[foo]`, `[foo="bar"]`)
- селекторы id (`#foo`, `#bar`)
- селекторы псевдо-элементов (`div:first-of-type`)

Вы также можете использовать комбинации:

- выбор только непосредственных потомков (`div > #bar > .foo`)
- выбор элементов, являющихся потомками (`div #bar .foo`)
- селектор выбора соседа идущего за элементом (`div + .foo`)
- селектор выбора соседей идущих после элемента (`div ~ .foo`)

### Компоненты Vue

Компоненты Vue также являются корректными селекторами.

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

### Опция поиска объекта

#### Name

Использование объекта для опции поиска, позволяет Vue Test Utils выбирать элементы по `name` компонента на компонентах обёртках.

```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

#### Ref

Использование опции поиска объекта позволяет Vue Test Utils выбирать элементы по `$ref` на компонентах обёрток.

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
