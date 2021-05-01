## Tester les `key`, la souris et les autres événements

<div class="vueschool"><a href="https://vueschool.io/lessons/traversing-the-dom?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn to traverse and interact with the DOM with a free video lesson from Vue School">Apprenez à traverser et à interagir avec le DOM grâce à une leçon gratuite sur Vue School</a></div>

### Événements déclencheurs

Le `Wrapper` expose une méthode `trigger`. Il peut être utile pour déclencher les événements du DOM.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.trigger('click')
```

Vous devez savoir que la méthode `find` renvoie également un `Wrapper`. En supposant que `MyComponent` contient un bouton, le code suivant clique sur le bouton.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.find('button').trigger('click')
})
```

### Les Options

La méthode `trigger` prend en option un objet optionnel `options`. Les propriétés dans cet objet `options` sont ajoutés à l'événement.

A noter que la cible ne peut pas être ajoutée dans l'objet `options`.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.trigger('click', { button: 0 })
})
```

### Exemple de clic de souris

**Composante à l'essai**

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

### Exemple de clavier

**Composante à l'essai**

Ce composant permet d'incrémenter/décrémenter la quantité à l'aide de différentes clés.

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

  it('Up arrow key increments quantity by 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).toBe(1)
  })

  it('Down arrow key decrements quantity by 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).toBe(4)
  })

  it('Escape sets quantity to 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Magic character "a" sets quantity to 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      key: 'a'
    })
    expect(wrapper.vm.quantity).toBe(13)
  })
})
```

**Limitations**

Un nom de clé après le point `keydown.up` est traduit par un `keyCode`. Ceci est pris en charge pour les noms suivants :

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
