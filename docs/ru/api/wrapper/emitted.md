# emitted()

Возвращает объект, содержащий вызванные пользовательские события в `Wrapper` `vm`.

- **Возвращает:** `{ [name: string]: Array<Array<any>> }`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() возвращает следующий объект:
{
  foo: [[], [123]]
}
*/

// проверка, что событие было вызвано
expect(wrapper.emitted().foo).toBeTruthy()

// проверка, что событие вызывалось определённое число раз
expect(wrapper.emitted().foo.length).toBe(2)

// проверка, что с событием были переданы определённые данные
expect(wrapper.emitted().foo[1]).toEqual([123])
```

Вы также можете написать это так:

```js
// проверка, что событие было вызвано
expect(wrapper.emitted('foo')).toBeTruthy()

// проверка, что событие вызывалось определённое число раз
expect(wrapper.emitted('foo').length).toBe(2)

// проверка, что с событием были переданы определённые данные
expect(wrapper.emitted('foo')[1]).toEqual([123])
```