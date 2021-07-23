## setChecked

Cette méthode est un alias du code suivant

```js
wrapperArray.wrappers.forEach(wrapper => wrapper.setChecked(checked))
```

- **Arguments:**

  - `{Boolean} checked (default: true)`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount({
  data() {
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
expect(wrapper.vm.t1).toEqual(false)
expect(wrapper.vm.t2).toEqual('')
wrapperArray.setChecked()
expect(wrapper.vm.t1).toEqual(true)
expect(wrapper.vm.t2).toEqual('foo')
```
