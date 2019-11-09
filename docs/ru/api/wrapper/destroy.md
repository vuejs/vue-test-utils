## destroy()

Уничтожает экземпляр компонента Vue.

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed() {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```

Если опция `attachToDocument` была `true` при монтировании, DOM элементы компонента будут также удалены из документа.

Для функциональных компонентов, `destroy` только удаляет отрисованные элементы DOM из документа.
