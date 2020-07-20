## isEmpty()

::: warning Deprecation warning
`isEmpty` は非推奨となり、将来のリリースで削除される予定です。

[jest-dom](https://github.com/testing-library/jest-dom#custom-matchers) で提供されているようなカスタムマッチャの使用を検討してください。

findComponent で使用する場合は、 `findComponent(Comp).element` で DOM 要素にアクセスします。
:::

`WrapperArray` のすべての `Wrapper` に子ノードを含んでいないか検証します。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).toBe(true)
```
