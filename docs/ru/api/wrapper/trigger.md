# trigger(eventName)

Вызывает событие на `Wrapper` DOM узле.

В `trigger` также можно передать опциональный объект `options`. Свойства объекта `options` будут добавлены к Event.

- **Принимает:**
  - `{string} eventName`
  - `{Object} options`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo'

const clickHandler = sinon.stub()
const wrapper = mount(Foo, {
  propsData: { clickHandler }
})

wrapper.trigger('click')

wrapper.trigger('click', {
  button: 0
})

expect(clickHandler.called).toBe(true)
```

- **Установка target для event:**

Под капотом, `trigger` создаёт объект `Event` и вызывает событие на элементе Wrapper.

Невозможно изменить значение `target` объекта `Event`, поэтому вы не можете установить `target` в объекте опций.

Чтобы добавить атрибут к `target`, вам нужно установить значение элемента Wrapper перед вызовом `trigger`. Вы можете сделать это с помощью свойства `element`.

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```