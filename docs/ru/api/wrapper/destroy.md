# destroy()

Уничтожает экземпляр компонента Vue.

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed () {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```