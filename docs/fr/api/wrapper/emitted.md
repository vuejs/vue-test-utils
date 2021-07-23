## emitted

Renvoie un objet contenant des événements personnalisés émis par le `Wrapper` `vm`.

- **Retours:** `{ [name: string]: Array<Array<any>> }`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'

test('emit demo', async () => {
  const wrapper = mount(Component)

  wrapper.vm.$emit('foo')
  wrapper.vm.$emit('foo', 123)

  await wrapper.vm.$nextTick() // Attendre que les $emits aient été traités

  /*
  wrapper.emitted() renvoie l'objet suivant :
  {
    foo: [[], [123]]
  }
  */

  // Affirmation de l'élément émis
  expect(wrapper.emitted().foo).toBeTruthy()

  // Affirmation du nombre d'élément
  expect(wrapper.emitted().foo.length).toBe(2)

  // Affirmation du paramètre additionnel
  expect(wrapper.emitted().foo[1]).toEqual([123])
})
```

Vous pouvez également écrire ce qui précède comme suit :

```js
// Affirmation de l'élément émis
expect(wrapper.emitted('foo')).toBeTruthy()

// Affirmation du nombre d'élément
expect(wrapper.emitted('foo').length).toBe(2)

// Affirmation du paramètre additionnel
expect(wrapper.emitted('foo')[1]).toEqual([123])
```

La méthode `.emitted()` renvoie le même objet chaque fois qu'il est appelé, et non un nouveau, et donc l'objet se met à jour lorsque de nouveaux événements sont déclenchés :

```js
const emitted = wrapper.emitted()

expect(emitted.foo.length).toBe(1)

// Faire quelque chose pour que le "wrapper" émette l'événement "foo"

expect(emitted.foo.length).toBe(2)
```
