# Testing Key, Mouse and other DOM events

## Trigger events

The `Wrapper` expose a `trigger` method. It can be used to trigger DOM events.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

You should be aware, that find returns a wrapper as well. Assuming `MyComponent` contains a button, the following code clicks the button.

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## Options

The trigger method takes an optional `options` object. The properties in the `options` object are added to the Event.

You can run preventDefault on the event by passing `preventDefault: true` in `options`.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', {preventDefault: true})
```


## Mouse Click Example

**Component under test**

```js
<template>
<div>
  <button class="yes" @click="callYes">Yes</button>
  <button class="no" @click="callNo">No</button>
</div>
</template>
<script>
export default {
  name: 'YesNoComponent',
  props: {
    callMe: {
      type: Function
    }
  },
  methods: {
    callYes() {
      this.callMe('yes')
    },
    callNo() {
      this.callMe('no')
    }
  }
}
</script>

```

**Test**

```js
import YesNoComponent from '@/components/YesNoComponent'
import { mount } from 'vue-test-utils'
import sinon from 'sinon'

describe('Click event', () => {
  it('Click on yes button calls our method with argument "yes"', () => {
    const spy = sinon.spy()
    const wrapper = mount(YesNoComponent, {
      propsData: {
        callMe: spy
      }
    })
    wrapper.find('button.yes').trigger('click')

    spy.should.have.been.calledWith('yes')
  })
})
```

## Keyboard Example

**Component under test**

This component allows to increment/decrement the quantity using various keys.

```js
<template>
<input type="text" @keydown.prevent="onKeydown" v-model="quantity" />
</template>
<script>
const KEY_DOWN = 40
const KEY_UP = 38
const ESCAPE = 27
const CHAR_A = 65

export default {
  data() {
    return {
      quantity: 0
    }
  },
  methods: {
    increment() {
      this.quantity += 1
    },
    decrement() {
      this.quantity -= 1
    },
    clear() {
      this.quantity = 0
    },
    onKeydown(e) {
      if (e.keyCode === ESCAPE) {
        this.clear()
      }
      if (e.keyCode === KEY_DOWN) {
        this.decrement()
      }
      if (e.keyCode === KEY_UP) {
        this.increment()
      }
      if (e.which === CHAR_A) {
        this.quantity = 13
      }
    }
  },
  watch: {
    quantity: function (newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>

```

**Test**

```js
import QuantityComponent from '@/components/QuantityComponent'
import { mount } from 'vue-test-utils'

describe('Key event tests', () => {
  it('Quantity is zero by default', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).to.equal(0)
  })

  it('Cursor up sets quantity to 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).to.equal(1)
  })

  it('Cursor down reduce quantity by 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).to.equal(4)
  })

  it('Escape sets quantity to 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).to.equal(0)
  })

  it('Magic character "a" sets quantity to 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.quantity).to.equal(13)
  })
})

```

**Limitations**

A key name after the dot `keydown.up` is translated to a `keyCode`. This is supported for the following names:

* enter, tab, delete, esc, space, up, down, left, right

## Important

vue-test-utils triggers event synchronously. Consequently, `vue.nextTick` is not required.
