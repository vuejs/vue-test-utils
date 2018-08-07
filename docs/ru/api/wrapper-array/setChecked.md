## setChecked(checked)

Этот метод — псевдоним следующего кода.

```js
wrapperArray.wrappers.forEach(wrapper => wrapper.setChecked(checked))
```

- **Принимает:**
  - `{Boolean} checked (по умолчанию: true)`

- **Пример:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount({
  data () {
    return {
      t1: false,
      t2: ''
    }
  },
  template: `
    <div>
      <input type="checkbox" name="t1" class="foo" v-model="t1" />
      <input type="radio" name="t2" class="foo" value="foo" v-model="t2"/>
      <input type="radio" name="t2" class="bar" value="bar" v-model="t2"/>
    </div>`
})

const wrapperArray = wrapper.findAll('.foo')
expect(wrapper.vm.t1).to.equal(false)
expect(wrapper.vm.t2).to.equal('')
wrapperArray.setChecked()
expect(wrapper.vm.t1).to.equal(true)
expect(wrapper.vm.t2).to.equal('foo')
```
