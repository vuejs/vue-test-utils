# hasStyle(style, value)

`Wrapper` DOM 노드가 일치하는 스타일을 가졌는지 검증합니다.

`Wrapper` DOM 노드의 `style`에 일치하는 `value`가 있으면 `true`를 반환합니다.

**참고: `jsdom` 환경에서 실행하는 경우에만 인라인 스타일을 감지할 수 있습니다.**

- **전달인자:**
  - `{string} style`
  - `{string} value`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).toBe(true)
```
