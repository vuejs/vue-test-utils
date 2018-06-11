# emittedByOrder()

Возвращает массив, содержащий вызванные пользовательские события в `Wrapper` `vm`.

- **Возвращает:** `Array<{ name: string, args: Array<any> }>`

- **Пример:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder() возвращает следующий массив:
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// проверка, что события были вызваны в определённом порядке
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
