# emittedByOrder()

`Wrapper`의 `vm`에 의해 만들어진, 사용자 정의 이벤트를 포함한 배열을 반환합니다.

- **반환값:** `Array<{ name: string, args: Array<any> }>`

- **예제:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder()는 아래의 배열을 반환합니다.
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// 이벤트 발행 순서를 검증합니다.
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
