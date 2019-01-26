## find(selector)

Возвращает `Wrapper` первого DOM-узла или компонента Vue, соответствующего селектору.

Используйте любой корректный [селектор](../selectors.md).

- **Принимает:**

  - `{string|Component} selector`

- **Возвращает:** `{Wrapper}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.is('div')).toBe(true)

const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)

const barByName = wrapper.find({ name: 'bar' })
expect(barByName.is(Bar)).toBe(true)

const fooRef = wrapper.find({ ref: 'foo' })
expect(fooRef.is(Foo)).toBe(true)
```
