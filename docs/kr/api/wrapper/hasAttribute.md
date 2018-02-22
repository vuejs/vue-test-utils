# hasAttribute(attribute, value)

`Wrapper` DOM 노드가 속성과 일치하는 값을 가지고 있는지 검증합니다.

`Wrapper` DOM 노드가 일치하는 속성을 가지고 있으면 `true`를 반환합니다.

- **전달인자:**
  - `{string} attribute`
  - `{string} value`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).toBe(true)
```

- **다른 방법:**

`Wrapper.element`를 이용해 속성을 가져와 값에 기반한 검증을 할 수 있습니다.

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).toBe('foo')
```

이는 보다 좋은 에러 검증을 합니다.
