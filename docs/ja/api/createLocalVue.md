# createLocalVue()

- **戻り値:**
  - `{Component}`

- **使い方:**

createLocalVueは、グローバルVueクラスを汚染することなくコンポーネント、ミックスイン、プラグインを追加するためのVueクラスを返します。

`options.localVue`と一緒に使用してください。

```js
import { createLocalVue, shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  intercept: { foo: true }
})
expect(wrapper.vm.foo).to.equal(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).to.equal(false)
```

- **参照:** [よくある落とし穴](/ja/common-gotchas.md)