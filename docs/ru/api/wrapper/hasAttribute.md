# hasAttribute(attribute, value)

Проверка, что `Wrapper` DOM узел имеет атрибут с указанным значением.

Возвращает `true` если `Wrapper` DOM узел содержит атрибут с указанным значением.

- **Принимает:**
  - `{string} attribute`
  - `{string} value`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).toBe(true)
```

- **Альтернатива:**

Вы можете получить атрибут из `Wrapper.element` чтобы получить значение для проверки:

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).toBe('foo')
```

Это сделает ошибку при проверке более информативной.
