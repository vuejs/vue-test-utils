## Testing Key, Mouse and other DOM events

<div class="vueschool"><a href="https://vueschool.io/lessons/traversing-the-dom?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn to traverse and interact with the DOM with a free video lesson from Vue School">Learn to traverse and interact with the DOM with a free lesson on Vue School</a></div>

### Trigger events

The `Wrapper` exposes an async `trigger` method. It can be used to trigger DOM events.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.trigger('click')
})
```

You should be aware that the `find` method returns a `Wrapper` as well. Assuming `MyComponent` contains a button, the following code clicks the button.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.find('button').trigger('click')
})
```

### Options

The `trigger` method takes an optional `options` object. The properties in the `options` object are added to the Event.

Note that target cannot be added in the `options` object.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.trigger('click', { button: 0 })
})
```

### Mouse Click Example

**Component under test**

```html
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
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

it('Click on yes button calls our method with argument "yes"', async () => {
  const spy = sinon.spy()
  const wrapper = mount(YesNoComponent, {
    propsData: {
      callMe: spy
    }
  })
  await wrapper.find('button.yes').trigger('click')

  spy.should.have.been.calledWith('yes')
})
```

### Keyboard Example

**Component under test**

This component allows to increment/decrement the quantity using various keys.

```html
<template>
  <input type="text" @keydown.prevent="onKeydown" v-model="quantity" />
</template>

<script>
  const KEY_DOWN = 40
  const KEY_UP = 38
  const ESCAPE = 27

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
        if (e.key === 'a') {
          this.quantity = 13
        }
      }
    },

    watch: {
      quantity: function(newValue) {
        this.$emit('input', newValue)
      }
    }
  }
</script>
```

**Test**

```js
import QuantityComponent from '@/components/QuantityComponent'
import { mount } from '@vue/test-utils'

describe('Key event tests', () => {
  it('Quantity is zero by default', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Up arrow key increments quantity by 1', async () => {
    const wrapper = mount(QuantityComponent)
    await wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).toBe(1)
  })

  it('Down arrow key decrements quantity by 1', async () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    await wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).toBe(4)
  })

  it('Escape sets quantity to 0', async () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    await wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Magic character "a" sets quantity to 13', async () => {
    const wrapper = mount(QuantityComponent)
    await wrapper.trigger('keydown', {
      key: 'a'
    })
    expect(wrapper.vm.quantity).toBe(13)
  })
})
```

**Limitations**

A key name after the dot `keydown.up` is translated to a `keyCode`. This is supported for the following names:

| key name  | key code |
| --------- | -------- |
| enter     | 13       |
| esc       | 27       |
| tab       | 9        |
| space     | 32       |
| delete    | 46       |
| backspace | 8        |
| insert    | 45       |
| up        | 38       |
| down      | 40       |
| left      | 37       |
| right     | 39       |
| end       | 35       |
| home      | 36       |
| pageup    | 33       |
| pagedown  | 34       |
