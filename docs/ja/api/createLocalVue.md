# createLocalVue()

- **戻り値:**
  - `{Component}`

- **使い方:**

`createLocalVue` は、グローバル Vue クラスを汚染することなくコンポーネント、ミックスイン、プラグインを追加するための Vue クラスを返します。

`options.localVue` と一緒に使用してください。

```js
import { createLocalVue, shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  intercept: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

- **参照:** [一般的なヒント](../guides/common-tips.md#グローバルプラグインとミックスインの適用)
