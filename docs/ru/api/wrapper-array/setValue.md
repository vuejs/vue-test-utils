## setValue(value)

Этот метод — псевдоним следующего кода.

```js
wrapperArray.wrappers.forEach(wrapper => wrapper.setValue(value))
```

- **Принимает:**

  - `{any} value`

- **Пример:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount({
  data() {
    return {
      t1: '',
      t2: ''
    }
  },
  template: `
    <div>
      <input type="text" name="t1" class="foo" v-model="t1" />
      <input type="text" name="t2" class="foo" v-model="t2"/>
    </div>`
})

const wrapperArray = wrapper.findAll('.foo')
expect(wrapper.vm.t1).toEqual('')
expect(wrapper.vm.t2).toEqual('')
wrapperArray.setValue('foo')
expect(wrapper.vm.t1).toEqual('foo')
expect(wrapper.vm.t2).toEqual('foo')
```
