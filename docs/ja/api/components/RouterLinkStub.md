# RouterLinkStub

Vue Router の `router-link` コンポーネントをスタブするためのコンポーネントです。

レンダリングツリーにある router-link コンポーネントを見つけるためにこのコンポーネントを使用することができます。

- **使い方:**

スタブとしてマウンティングオプションにセットします。

```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  stubs: {
    RouterLink: RouterLinkStub
  }
})
expect(wrapper.find(RouterLinkStub).props().to).toBe('/some/path')
```
