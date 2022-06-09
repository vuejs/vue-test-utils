## O método emitted

Retorna um objeto contento eventos personalizados emitidos pelo `Wrapper` `vm`.

- **Retorna:** `{ [name: string]: Array<Array<any>> }`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'

test('emit demo', async () => {
  const wrapper = mount(Component)

  wrapper.vm.$emit('foo')
  wrapper.vm.$emit('foo', 123)

  await wrapper.vm.$nextTick() // Espera até que $emits ter sido manipulado

  /*
  wrapper.emitted() retorna o seguinte objeto:
  {
    foo: [[], [123]]
  }
  */

  // afirma que o evento tem sido emitido
  expect(wrapper.emitted().foo).toBeTruthy()

  // afirma que o evento contabiliza
  expect(wrapper.emitted().foo.length).toBe(2)

  // afirma que evento carrega
  expect(wrapper.emitted().foo[1]).toEqual([123])
})
```

Você também pode escrever o que está acima como o seguinte:

```js
// afirma que o evento tem sido emitido
expect(wrapper.emitted('foo')).toBeTruthy()

// afirma que o evento contabiliza
expect(wrapper.emitted('foo').length).toBe(2)

// afirma que evento carrega
expect(wrapper.emitted('foo')[1]).toEqual([123])
```

O método `.emitted()` retorna o mesmo objeto toda vez que ele for chamado, não um novo, e assim o objeto atualizará sempre que novos eventos forem disparados:

```js
const emitted = wrapper.emitted()

expect(emitted.foo.length).toBe(1)

// faça alguma coisa para fazer `wrapper` emitir o evento "foo"

expect(emitted.foo.length).toBe(2)
```
