## setChecked(checked)

checkbox 型もしくは radio 型の input 要素の checked の値をセットします。そして、 `v-model` に束縛されているデータを更新します。

- **引数:**
- `{Boolean} checked (デフォルト: true)`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const radioInput = wrapper.find('input[type="radio"]')
radioInput.setChecked()
```

- **注:**

`v-model` を経由して `radioInput.element.checked = true; radioInput.trigger('input')` で state に値をセットしようとすると、 `v-model` はトリガされません。 `v-model` は `change` イベントでトリガされます。

`checkboxInput.setChecked(checked)` は以下のコードのエイリアスです。

```js
checkboxInput.element.checked = checked
checkboxInput.trigger('click')
checkboxInput.trigger('change')
```
