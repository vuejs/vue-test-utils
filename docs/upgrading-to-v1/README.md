### Upgrading to V1.0

After a long time in Beta, Vue Test Utils finally released v1.0! We deprecated some methods that were not helpful, so you might see several deprecation warnings after upgrading. This guide will help you migrate away from them.

You can read the release notes for V1 [here](https://github.com/vuejs/vue-test-utils/releases) or the discussion around the deprecations [here](https://github.com/vuejs/rfcs/pull/161).

### `find`

In beta,`find` could be used to find both DOM nodes (using the `querySelector` syntax) or a component (via a component reference, a `ref` or a `name` option). This behavior is now split into two methods: `find` and `findComponent`.

If you were using this syntax:

- `find(Foo)`
- `find({ name: 'foo' })`
- `find({ ref: 'my-ref' })`

Change them to be `findComponent`.

You may continue using `find` on DOM nodes using the `querySelector` syntax.

### `isVueInstance`

This method was deprecated because it tends to encourage testing implementation details, which is a bad practice. Assertions using this can simply be removed; if you really need a substitute, you can do `expect((...).vm).toBeTruthy()`, which is basically what `isVueInstance` was doing.

### `contains`

Tests using `contains` can be replaced with `find` or `findComponent` or `get`. For example, `expect(wrapper.contains('#el')).toBe(true)` may be written as `wrapper.get('#el')`, which will throw an error if the selector is not matched. Another way to write this using `find` is `expect(wrapper.find('#el').element).toBeTruthy()`.

### `is`

You may rewrite tests using `is` to use `element.tagName` instead. For example, `wrapper.find('div').is('div')` may be written as `wrapper.find('div').element.tagName`.

### `isEmpty`

Finding out whether a DOM node is empty is not a Vue specific feature, and it is something that is difficult to get right. Rather than re-invent the wheel, we have decided it's better to delegate to an existing, well tested solution by default. Consider the excellent `toBeEmpty` matchers from [jest-dom](https://github.com/testing-library/jest-dom#tobeempty), for example, if you are using Jest.

### `isVisible`

See `isEmpty` above. Consider using [toBeVisible](https://github.com/testing-library/jest-dom#tobevisible) from `jest-dom` if you are using Jest. For example:

```js
// old assertion
expect(wrapper.find('.selector').isVisible()).toBeTruthy()

// new assertion
// consider making this matcher globally availalbe in your tests!
import '@testing-library/jest-dom'

expect(wrapper.find('.selector').element).toBeVisible()
```

### `name`

Asserting against `name` encourages testing implementation details, which is a bad practice. If you need this feature, though, you can use `vm.$options.name` for Vue components or `element.tagName` for DOM nodes. Again, consider if you really need this test - it's likely you don't.

### `setMethods` and `mountingOptions.methods`

By using `setMethods`, you are mutating the Vue instance - this is not something Vue supports, and may lead to coupled, flaky tests.

There is no straight forward replacement for this. If you have a complex method you would like to stub out, consider moving it another file and using your test runner's stub or mock functionality.

For example, you may want to avoid an API call:

```js
const Foo = {
  created() {
    this.getData()
  },
  methods: {
    getData() {
      axios.get('...')
    }
  }
}
```

Instead of doing:

```js
mount(Foo, {
  methods: {
    getData: () => {}
  }
})
```

Mock out the `axios` dependency. In Jest, for example, you can do `jest.mock('axios')`. This will prevent the API call, without mutating your Vue component.

If you need more help migrating, you can join the [VueLand server](https://chat.vuejs.org/) on Discord.

### Deprecation Warnings

Deprecation warnings can be silenced.

```js
import { config } from '@vue/test-utils'

config.showDeprecationWarnings = false
```
