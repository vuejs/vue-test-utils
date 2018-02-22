# setMethods(methods)

Устанавливает методы `Wrapper` `vm` и выполняет принудительное обновление.

**Обратите внимание, что `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**
  - `{Object} methods`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).toBe(true)
```
