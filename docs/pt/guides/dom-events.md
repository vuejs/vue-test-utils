## Testando eventos de Teclado, Rato e outros do DOM

<div class="vueschool"><a href="https://vueschool.io/lessons/traversing-the-dom?friend=vuejs" target="_blank" rel="sponsored noopener" title="Aprenda a percorrer e interagir com o DOM em uma aula gratuita na Vue School">Aprenda a percorrer e interagir com o DOM em uma aula gratuita na Vue School</a></div>

### Acionar eventos

O `Wrapper` expõe um método `trigger` assíncrono. Ele pode ser usado para acionar eventos do DOM.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.trigger('click')
})
```

Você deve estar ciente de que o método `find` retorna também um `Wrapper`. Assumindo que o `MyComponent` contém um botão, o seguinte código clica neste botão.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.find('button').trigger('click')
})
```

### Opções

O método `trigger` recebe um objeto `options` opcional. As propriedades dentro do objeto `options` são adicionadas ao Event.

Repare que o alvo não pode ser adicionado dentro do objeto `options`.

```js
test('triggers a click', async () => {
  const wrapper = mount(MyComponent)

  await wrapper.trigger('click', { button: 0 })
})
```

### Exemplo de Clique do Rato

**Componente sob teste**

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

**Testar**

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

### Exemplo de Teclado

**Componente sob teste**

Este componente permite incrementar/decrementar a quantidade usando várias teclas.

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

**Testar**

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

**Limitações**

O nome da tecla depois do ponto `keydown.up` é traduzido para um `KeyCode` (código da tecla). Isto é suportado para os seguintes nomes:

| nome da tecla | código da tecla |
| ------------- | --------------- |
| enter         | 13              |
| esc           | 27              |
| tab           | 9               |
| space         | 32              |
| delete        | 46              |
| backspace     | 8               |
| insert        | 45              |
| up            | 38              |
| down          | 40              |
| left          | 37              |
| right         | 39              |
| end           | 35              |
| home          | 36              |
| pageup        | 33              |
| pagedown      | 34              |
