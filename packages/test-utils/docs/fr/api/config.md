# Config

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>vue-test-utils includes a config object to defined options used by vue-test-utils.</p>

## `vue-test-utils` Config Options

### `stubs`

- type: `Object`
- default: `{
  transition: TransitionStub,
  'transition-group': TransitionGroupStub
}`

Stubs to use in components. These are overwritten by `stubs` passed in the mounting options.

When passing `stubs` as an array in the mounting options, `config.stubs` are converted to an array, and will stub components with a basic component that returns `<!---->`.

Example:

```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs['my-compomnent'] = '<div />'
```
