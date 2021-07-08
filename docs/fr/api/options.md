# L'option Mount

Options pour `mount` et `shallowMount`.

:::tip
Outre les options documentées ci-dessous, l'objet `options` peut contenir toute option qui serait valide dans un appel à `new Vue ({ /*les options ici*/ }). Ces options seront fusionnées avec les options existantes du composant lorsqu'il sera monté avec`mount`/`shallowMount`

[Voir les autres options pour des exemples](#other-options)
:::

- [Mounting Options](#mounting-options)
  - [context](#context)
  - [data](#data)
  - [slots](#slots)
  - [scopedSlots](#scopedslots)
  - [stubs](#stubs)
  - [mocks](#mocks)
  - [localVue](#localvue)
  - [attachTo](#attachto)
  - [attachToDocument](#attachtodocument)
  - [attrs](#attrs)
  - [propsData](#propsdata)
  - [listeners](#listeners)
  - [parentComponent](#parentcomponent)
  - [provide](#provide)
  - [Other options](#other-options)

## context

- type: `Object`

Transmet du contexte à la composante fonctionnelle. Ne peut être utilisé qu'avec des [composants fonctionnels](https://vuejs.org/v2/guide/render-function.html#Functional-Components).

Exemple:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```

## data

- type: `Function`

Transmet les données à un composant. Il fusionnera avec la fonction `data` existante.

Exemple:

```js
const Component = {
  template: `
    <div>
      <span id="foo">{{ foo }}</span>
      <span id="bar">{{ bar }}</span>
    </div>
  `,

  data() {
    return {
      foo: 'foo',
      bar: 'bar'
    }
  }
}

const wrapper = mount(Component, {
  data() {
    return {
      bar: 'my-override'
    }
  }
})

wrapper.find('#foo').text() // 'foo'
wrapper.find('#bar').text() // 'my-override'
```

## slots

- type: `{ [name: string]: Array<Component>|Component|string }`

Fournis un objet de contenu slot au composant . La clé correspond au nom du slot. La valeur peut être soit un composant , soit un tableau de composants, soit une chaîne de modèle, soit du texte.

Exemple:

```js
import Foo from './Foo.vue'
import MyComponent from './MyComponent.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const yourComponent = {
  props: {
    foo: {
      type: String,
      required: true
    }
  },
  render(h) {
    return h('p', this.foo)
  }
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // Correspondra à `<slot name="FooBar" />`.
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />',
    quux: '<your-component foo="lorem"/><your-component :foo="yourProperty"/>'
  },
  stubs: {
    // utilisé pour enregistrer les composants personnalisés
    'my-component': MyComponent,
    'your-component': yourComponent
  },
  mocks: {
    // utilisé pour ajouter des propriétés au contexte de rendu
    yourProperty: 'ipsum'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- type: `{ [name: string]: string|Function }`

Fournis un objet de portée slot au composant. La clé correspond au nom du slot.

Vous pouvez définir le nom des props à l'aide de l'attribut slot-scope :

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

Sinon, les props sont disponibles en tant qu'objet `props` lorsque le slot est évalué :

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

Vous pouvez également passer une fonction qui prend les props comme argument :

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function(props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

Ou vous pouvez utiliser JSX. Si vous écrivez JSX dans une méthode, `this.$createElement` est auto-injectée par babel-plugin-transform-vue-jsx :

```js
shallowMount(Component, {
  scopedSlots: {
    foo(props) {
      return <div>{props.text}</div>
    }
  }
})
```

::: warning Élément Racine requis
En raison de la mise en œuvre interne de cette fonctionnalité, le contenu du slot doit renvoyer un élément racine, même si un slot porté est autorisé à renvoyer un ensemble d'éléments.

Si vous avez besoin de cette fonctionnalité dans un test, la solution recommandée est d'envelopper le composant testé dans un autre composant et de monter celui-ci :
:::

```javascript
const WrapperComp = {
  template: `
  <ComponentUnderTest v-slot="props">
    <p>Using the {{props.a}}</p>
    <p>Using the {{props.a}}</p>
  </ComponentUnderTest>
  `,
  components: {
    ComponentUnderTest
  }
}
const wrapper = mount(WrapperComp).find(ComponentUnderTest)
```

## stubs

- type: `{ [name: string]: Component | string | boolean } | Array<string>`

Les composants enfants Stubs peuvent être un tableau de noms de composants à un stub, ou un objet. Si le `stubs` est un tableau, chaque stub est `<${component name}-stub>`.

**Avis de déprédation :**

Lors de l'ajout de composants, la fourniture d'une chaîne de caractères (`ComponentToStub: '<div class="stubbed" />`) n'est plus supportée.

Exemple:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // stub avec une implémentation spécifique
    'registered-component': Foo,
    // créer un stub par défaut.
    // le nom du composant du stub par défaut est un autre composant dans ce cas.
    // le stub par défaut est <${the component name of default stub}-stub>.
    'another-component': true
  }
})
```

## mocks

- type: `Object`

Ajouter des propriétés supplémentaires à l'instance. Utile pour simuler des injections globales.

Exemple:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

::: tip
Pour simuler `$root` veuillez utiliser l'option `parentComponent` comme décrit [ici](https://github.com/vuejs/vue-test-utils/issues/481#issuecomment-423716430)
:::

## localVue

- type: `Vue`

Une copie locale de Vue créée par [`createLocalVue`](./createLocalVue.md) à utiliser lors du montage du composant. L'installation de plugins sur cette copie de `Vue` évite de polluer la copie originale de `Vue`.

Exemple:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [{ path: '/foo', component: Foo }]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

## attachTo

- type: `HTMLElement | string`
- default: `null`

Il spécifie soit un HTMLElement spécifique, soit une chaîne de sélection CSS ciblant un HTMLElement, sur lequel votre composant sera entièrement monté dans le document.

Lorsque vous le fixez au DOM, vous devez appeler `wrapper.destroy()` à la fin de votre test pour
supprimer les éléments rendus du document et détruire l'instance constitutive.

::: tip
Lorsque vous utilisez `attachTo : document.body`, une nouvelle `div` sera ajoutée au lieu de remplacer le corps entier. Ceci est conçu pour imiter le comportement de Vue3 et simplifier une future migration. Voir [ce commentaire](https://github.com/vuejs/vue-test-utils/issues/1578#issuecomment-674652747) pour plus de détails
:::

```js
const div = document.createElement('div')
div.id = 'root'
document.body.appendChild(div)

const Component = {
  template: '<div>ABC</div>'
}
let wrapper = mount(Component, {
  attachTo: '#root'
})
expect(wrapper.vm.$el.parentNode).to.not.be.null
wrapper.destroy()

wrapper = mount(Component, {
  attachTo: document.getElementById('root')
})
expect(wrapper.vm.$el.parentNode).to.not.be.null
wrapper.destroy()
```

## attachToDocument

- type: `boolean`
- default: `false`

::: warning Avertissement de déprédation
L'option `attachToDocument` est dépréciée et sera supprimée dans les prochaines versions. Utilisez plutôt [`attachTo`](#attachto). Par exemple, si vous devez attacher le composant au document.body :

```js
const elem = document.createElement('div')
if (document.body) {
  document.body.appendChild(elem)
}
wrapper = mount(Component, {
  attachTo: elem
})
```

:::

Comme [`attachTo`](#attachto), mais crée automatiquement un nouvel élément `div` pour vous et l'insère dans le corps.

Lorsque vous l'attachez au DOM, vous devez appeler `wrapper.destroy()` à la fin de votre test pour
supprimer les éléments rendus du document et détruire l'instance constitutive.

## attrs

- type: `Object`

Défini l'objet `$attrs` de l'instance du composant.

## propsData

- type: `Object`

Défini les props de l'instance du composant lorsque le composant est monté.

Exemple:

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: tip
Il convient de noter que "propsData" est en fait une [API Vue](https://vuejs.org/v2/api/#propsData), et non une
option de montage de Vue Test Utils. Il est traité par [`extends`](https://vuejs.org/v2/api/#extends).
Veuillez consulter [les autres options](#other-options).
:::

## listeners

- type: `Object`

Défini l'objet `$listeners`de l'instance du composant.

Exemple:

```js
const Component = {
  template: '<button v-on:click="$emit(\'click\')"></button>'
}
const onClick = jest.fn()
const wrapper = mount(Component, {
  listeners: {
    click: onClick
  }
})

wrapper.trigger('click')
expect(onClick).toHaveBeenCalled()
```

## parentComponent

- type: `Object`

Composant à utiliser comme parent pour un composant monté.

Exemple:

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.$options.name).toBe('foo')
```

## provide

- type: `Object`

Passe les propriétés des composants à utiliser dans l'injection. Voir [provide/inject](https://vuejs.org/v2/api/#provide-inject).

Exemple:

```js
const Component = {
  inject: ['foo'],
  template: '<div>{{this.foo()}}</div>'
}

const wrapper = shallowMount(Component, {
  provide: {
    foo() {
      return 'fooValue'
    }
  }
})

expect(wrapper.text()).toBe('fooValue')
```

## Les autres options

Lorsque les options pour `mount` et `shallowMount` contiennent des options autres que les options de montage, les options des composants sont écrasées par celles qui utilisent [extends](https://vuejs.org/v2/api/#extends).

```js
const Component = {
  template: '<div>{{ foo }}</div>',
  data() {
    return {
      foo: 'fromComponent'
    }
  }
}
const options = {
  data() {
    return {
      foo: 'fromOptions'
    }
  }
}

const wrapper = mount(Component, options)

expect(wrapper.text()).toBe('fromOptions')
```
