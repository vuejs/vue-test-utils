## Useful Libraries for Testing

Vue Test Utils provides useful methods for testing Vue components. Community members have also written some additional libraries which either extend `vue-test-utils` with extra useful methods, or provide tools for testing other things found in Vue applications.

### Vue Testing Library

[Vue Testing Library](https://github.com/testing-library/vue-testing-library) is a set of tools focused on testing components without relying on implementation details. Built with accessibility in mind, its approach also makes refactoring a breeze.

It is built on top of Vue Test Utils.

### `vuex-mock-store`

[`vuex-mock-store`](https://github.com/posva/vuex-mock-store) provides a simple and straightforward mock store to simplify testing components consuming a Vuex store.

### `jest-matcher-vue-test-utils`

[`jest-matcher-vue-test-utils`](https://github.com/hmsk/jest-matcher-vue-test-utils) adds additional matchers for the Jest test runner with the goal of making assertions more expressive.

### `jest-mock-axios`

[`jest-mock-axios`](https://github.com/knee-cola/jest-mock-axios) allows you to easily mock `axios`, a common HTTP client, in your tests. It works out of the box with Jest, and the author provides guidance on supporting other test runners in the documentation.
