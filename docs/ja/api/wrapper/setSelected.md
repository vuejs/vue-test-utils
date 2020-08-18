## setSelected()

option 要素を選択します。そして、 `v-model` に束縛されているデータを更新します。

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setSelected demo', async () => {
  const wrapper = mount(Foo)
  const options = wrapper.find('select').findAll('option')

  await options.at(1).setSelected()

  expect(wrapper.find('option:checked').element.value).toBe('bar')
})
```

- **注:**

`v-model` を経由して `option.element.selected = true; parentSelect.trigger('input')` で state に値をセットしようとすると、 `v-model` はトリガされません。 `v-model` は `change` イベントでトリガされます。

`option.setSelected()` は以下のコードのエイリアスです。

```js
option.element.selected = true
parentSelect.trigger('change')
```
