# Tester le clavier, la souris et les autres évènements DOM

## Déclencheur d'évènements


Le `Wrapper` expose une méthode `trigger`. Elle peut être utilisée pour déclencher des évènements du DOM.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click')
```

Vous devez être au courant que la méthode `find` retourne aussi un `Wrapper`. En partant du principe que `MyComponent` contient un bouton, le code suivant clique sur le bouton.

```js
const wrapper = mount(MyComponent)

wrapper.find('button').trigger('click')
```

## Options

La méthode `trigger` prend en paramètre optionnel l'objet `options`. Les propriétés de l'objet `options` sont ajoutées à l'évènement.

```js
const wrapper = mount(MyButton)

wrapper.trigger('click', { button: 0 })
```


## Exemple de clic de souris

**Composant à tester**

```html
<template>
<div>
  <button class="yes" @click="callYes">Oui</button>
  <button class="no" @click="callNo">Non</button>
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
      this.callMe('oui')
    },
    callNo() {
      this.callMe('non')
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

describe('Évènement click', () => {
  it("Cliquer sur le bouton oui appelle notre méthode avec l'argument « oui »", () => {
    const spy = sinon.spy()
    const wrapper = mount(YesNoComponent, {
      propsData: {
        callMe: spy
      }
    })
    wrapper.find('button.yes').trigger('click')

    spy.should.have.been.calledWith('oui')
  })
})
```

## Exemple de test clavier

**Composant à tester**

Ce composant permet d'incrémenter / décrémenter la quantité en utilisant différentes touches.

```html
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
import { mount } from '@vue/test-utils'

describe('Tests événement clavier', () => {
  it('La quantité est zéro par défaut', () => {
    const wrapper = mount(QuantityComponent)
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('La flèche du haut positionne la quantité à 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown.up')
    expect(wrapper.vm.quantity).toBe(1)
  })

  it('La flèche du bas réduit la quantité de 1', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.down')
    expect(wrapper.vm.quantity).toBe(4)
  })

  it('La touche Échap positionne la quantité à 0', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.vm.quantity = 5
    wrapper.trigger('keydown.esc')
    expect(wrapper.vm.quantity).toBe(0)
  })

  it('Le caractère magique `a` positionne la quantité à 13', () => {
    const wrapper = mount(QuantityComponent)
    wrapper.trigger('keydown', {
      which: 65
    })
    expect(wrapper.vm.quantity).toBe(13)
  })
})

```

**Limitations**

Un nom de touche après le point `keydown.up` est traduit vers un `keyCode`. Cela est supporté pour les noms suivant :

* `enter`, `tab`, `delete`, `esc`, `space`, `up`, `down`, `left`, `right`

## Important

`vue-test-utils` déclenche les évènements de façon synchrone. Par conséquent, `vue.nextTick` n'est pas requis.
