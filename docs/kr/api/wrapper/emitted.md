# emitted()

`Wrapper`의 `vm`에 의해 만들어진, 사용자 정의 이벤트를 포함한 객체를 반환합니다.

- **반환값:** `{ [name: string]: Array<Array<any>> }`

- **예제:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() 는 아래의 객체를 반환합니다.
{
  foo: [[], [123]]
}
*/

// 실행된 event를 검증합니다.
expect(wrapper.emitted().foo).toBeTruthy()

// 이벤트의 수를 검증합니다.
expect(wrapper.emitted().foo.length).toBe(2)

// 이벤트의 페이로드를 검증합니다.
expect(wrapper.emitted().foo[1]).toEqual([123])
```
