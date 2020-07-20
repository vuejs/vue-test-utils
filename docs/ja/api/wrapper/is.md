## is(selector)

::: warning Deprecation warning
`is` を使用して、 DOM ノードまたは `vm` がセレクタに一致することをアサートするのは非推奨となり、削除される予定です。

[jest-dom](https://github.com/testing-library/jest-dom#custom-matchers) で提供されているようなカスタムマッチャの使用を検討してください。または、 DOM 要素などに対するアサーションには、代わりにネイティブの [Element.tagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName) を使用してください。

テストを維持するためには、以下の置き換えが有効です。

- `is('DOM_SELECTOR')` は `wrapper.element.tagName` のアサーションです。
- `is('ATTR_NAME')` は真に `wrapper.attributes('ATTR_NAME')` のアサーションです。
- `is('CLASS_NAME')` は真に `wrapper.classes('CLASS_NAME')` のアサーションです。

findComponent で使用する場合は、 `findComponent(Comp).element` で DOM 要素にアクセスします。
:::

`Wrapper` DOM ノード、または `vm` が[セレクタ](../selectors.md)と一致しているか検証します。

- **引数:**

  - `{string|Component} selector`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
