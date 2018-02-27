# emittedByOrder()

`Wrapper` `vm` によって生成されたカスタムイベントを含む配列を返します。

- **戻り値:** `Array<{ name: string, args: Array<any> }>`

- **例:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder() は次の配列を返します
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// イベントの発行順序を検証します
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
