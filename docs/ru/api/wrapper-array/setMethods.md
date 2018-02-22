
# setMethods(methods)

Устанавливает методы `Wrapper` `vm` и выполняет принудительное обновление каждого `Wrapper` в `WrapperArray`.

**Обратите внимание, что каждый `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**
  - `{Object} methods`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).toBe(true)
```
