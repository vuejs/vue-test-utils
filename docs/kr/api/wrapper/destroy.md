# destroy()

Vue 컴포넌트 인스턴스를 파괴합니다.

- **예제:**

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
