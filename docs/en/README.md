# vue-test-utils

vue-test-utils is the official test library for Vue.js. 

It provides methods for unit testing Vue components.

## Example

```js
import { mount } from 'vue-test-utils'
import Counter from './Counter.vue'

const wrapper = mount(Counter)
wrapper.find('button').trigger('click')
expect(wrapper.text()).toContain('1')
```


## Getting started

To get started using Vue Test Utils, please see [using with jest]().

If you're new to unit testing, please read our [introduction to unit tests]().

## Testing single file components (SFCs)

- [Testing SFCs with Jest](guides/testing-SFCs-with-jest.md)
- [Testing SFCs with Mocha](guides/testing-SFCs-with-mocha-webpack.md)

## Example projects

- [example with Jest](https://github.com/eddyerburgh/vue-test-utils-jest-example)
- [example with Mocha](https://github.com/eddyerburgh/vue-test-utils-mocha-example)
- [example with tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [example with AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)
