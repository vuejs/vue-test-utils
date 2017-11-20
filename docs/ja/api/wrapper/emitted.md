# emitted()

`Wrapper` `vm` によって生成されたカスタムイベントを含むオブジェクトを返します。

- **戻り値:** `{ [name: string]: Array<Array<any>> }`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() は次のオブジェクトを返します:
{
  foo: [[], [123]]
}
*/

// イベントが発行されたか検証します
expect(wrapper.emitted().foo).toBeTruthy()

// イベントの数を検証します
expect(wrapper.emitted().foo.length).toBe(2)

// イベントのペイロードを検証します
expect(wrapper.emitted().foo[1]).toEqual([123])
```

別の構文があります。

```js
// イベントが発行されたか検証します
expect(wrapper.emitted('foo')).toBeTruthy()

// イベントの数を検証します
expect(wrapper.emitted('foo').length).toBe(2)

// イベントのペイロードを検証します
expect(wrapper.emitted('foo')[1]).toEqual([123])
```
