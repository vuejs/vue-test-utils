# emitted()

Возвращает объект, содержащий вызванные пользовательские события в `Wrapper` `vm`.

- **Возвращает:** `{ [name: string]: Array<Array<any>> }`

- **Пример:**

```js
import { mount } from '@vue/test-utils'

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

Метод `.emitted()`, когда он вызывается, каждый раз возвращает тот же объект, а не новый, поэтому объект будет обновляться при генерации новых событий:

```js
const emitted = wrapper.emitted()

expect(emitted.foo.length).toBe(1)

// делаем что-то, что заставляет `wrapper` сгенерировать событие "foo"

expect(emitted.foo.length).toBe(2)
```