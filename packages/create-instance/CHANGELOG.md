# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.0.0-beta.28"></a>

# [1.0.0-beta.28](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.27...v1.0.0-beta.28) (2018-12-29)

### Bug Fixes

- add stub without modifying ([#1085](https://github.com/vuejs/vue-test-utils/issues/1085)) ([1f4876e](https://github.com/vuejs/vue-test-utils/commit/1f4876e))
- keep components when adding stubs ([#1075](https://github.com/vuejs/vue-test-utils/issues/1075)) ([5e92c10](https://github.com/vuejs/vue-test-utils/commit/5e92c10))
- support registered components in scopedSlots ([#1065](https://github.com/vuejs/vue-test-utils/issues/1065)) ([d4c118b](https://github.com/vuejs/vue-test-utils/commit/d4c118b))
- use correct event type for checkbox v-model handler ([#1083](https://github.com/vuejs/vue-test-utils/issues/1083)) ([ef66c26](https://github.com/vuejs/vue-test-utils/commit/ef66c26))

<a name="1.0.0-beta.27"></a>

# [1.0.0-beta.27](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.26...v1.0.0-beta.27) (2018-12-09)

### Bug Fixes

- stop stubs leaking with localVue ([#1056](https://github.com/vuejs/vue-test-utils/issues/1056)) ([5500553](https://github.com/vuejs/vue-test-utils/commit/5500553))
- stub dynamic components ([#1051](https://github.com/vuejs/vue-test-utils/issues/1051)) ([4338403](https://github.com/vuejs/vue-test-utils/commit/4338403))

### Features

- do not stub unregistered components ([#1048](https://github.com/vuejs/vue-test-utils/issues/1048)) ([fb7a66c](https://github.com/vuejs/vue-test-utils/commit/fb7a66c))

<a name="1.0.0-beta.26"></a>

# [1.0.0-beta.26](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2018-11-26)

### Bug Fixes

- create stubs in render ([#1038](https://github.com/vuejs/vue-test-utils/issues/1038)) ([e1fd705](https://github.com/vuejs/vue-test-utils/commit/e1fd705)), closes [#973](https://github.com/vuejs/vue-test-utils/issues/973) [#994](https://github.com/vuejs/vue-test-utils/issues/994) [#995](https://github.com/vuejs/vue-test-utils/issues/995)
- do not remove cached constructors ([#962](https://github.com/vuejs/vue-test-utils/issues/962)) ([71ec3b9](https://github.com/vuejs/vue-test-utils/commit/71ec3b9))
- render all slots inside a <template> vnode ([#979](https://github.com/vuejs/vue-test-utils/issues/979)) ([c04d3bf](https://github.com/vuejs/vue-test-utils/commit/c04d3bf))
- stop extending from constructor functions ([#1014](https://github.com/vuejs/vue-test-utils/issues/1014)) ([2648213](https://github.com/vuejs/vue-test-utils/commit/2648213))
- support async components in stubs ([#1039](https://github.com/vuejs/vue-test-utils/issues/1039)) ([6a4e19d](https://github.com/vuejs/vue-test-utils/commit/6a4e19d)), closes [#1026](https://github.com/vuejs/vue-test-utils/issues/1026)

### Features

- pass listeners to functional components ([#1036](https://github.com/vuejs/vue-test-utils/issues/1036)) ([7a1a49e](https://github.com/vuejs/vue-test-utils/commit/7a1a49e))
- support lazily added components ([#1005](https://github.com/vuejs/vue-test-utils/issues/1005)) ([3653c60](https://github.com/vuejs/vue-test-utils/commit/3653c60))

### BREAKING CHANGES

- The tag name rendered by snapshots will use the rendered component tag, rather than the registered component name

<a name="1.0.0-beta.25"></a>

# [1.0.0-beta.25](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2018-09-08)

### Bug Fixes

- handle global stubs and functional extended components ([#943](https://github.com/vuejs/vue-test-utils/issues/943)) ([0d1ddd1](https://github.com/vuejs/vue-test-utils/commit/0d1ddd1))
- throw error if unsupported options passed in vue < 2.3 ([#910](https://github.com/vuejs/vue-test-utils/issues/910)) ([e8d9547](https://github.com/vuejs/vue-test-utils/commit/e8d9547))

### Performance Improvements

- use extends over createLocalVue ([#934](https://github.com/vuejs/vue-test-utils/issues/934)) ([af45a9d](https://github.com/vuejs/vue-test-utils/commit/af45a9d))

<a name="1.0.0-beta.24"></a>

# [1.0.0-beta.24](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2018-08-05)

### Bug Fixes

- reconcile the overridden prototype of component with \_Vue mixins ([#889](https://github.com/vuejs/vue-test-utils/issues/889)) ([73980c4](https://github.com/vuejs/vue-test-utils/commit/73980c4))
- wrap extended child components ([#840](https://github.com/vuejs/vue-test-utils/issues/840)) ([4faf5fb](https://github.com/vuejs/vue-test-utils/commit/4faf5fb))

### Features

- support scopedSlots mounting option for functional component ([#893](https://github.com/vuejs/vue-test-utils/issues/893)) ([7a04ff4](https://github.com/vuejs/vue-test-utils/commit/7a04ff4))

<a name="1.0.0-beta.23"></a>

# [1.0.0-beta.23](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.22...v1.0.0-beta.23) (2018-07-31)

### Bug Fixes

- add stubs/mocks to extended components ([#881](https://github.com/vuejs/vue-test-utils/issues/881)) ([862ce5c](https://github.com/vuejs/vue-test-utils/commit/862ce5c))

<a name="1.0.0-beta.22"></a>

# [1.0.0-beta.22](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.21...v1.0.0-beta.22) (2018-07-29)

### Bug Fixes

- add unused propsData as component attributes ([#865](https://github.com/vuejs/vue-test-utils/issues/865)) ([c747cd6](https://github.com/vuejs/vue-test-utils/commit/c747cd6))
- clear static tree for slots render ([#862](https://github.com/vuejs/vue-test-utils/issues/862)) ([c7ac0d9](https://github.com/vuejs/vue-test-utils/commit/c7ac0d9))
- keep the overrides prototype information of component ([#856](https://github.com/vuejs/vue-test-utils/issues/856)) ([0371793](https://github.com/vuejs/vue-test-utils/commit/0371793))
- stub globally registered components ([#859](https://github.com/vuejs/vue-test-utils/issues/859)) ([5af3677](https://github.com/vuejs/vue-test-utils/commit/5af3677))
- support multiple default slot nodes ([#861](https://github.com/vuejs/vue-test-utils/issues/861)) ([85dd3ec](https://github.com/vuejs/vue-test-utils/commit/85dd3ec))

### Features

- add support for JSX scopedSlots value ([#871](https://github.com/vuejs/vue-test-utils/issues/871)) ([13bcaeb](https://github.com/vuejs/vue-test-utils/commit/13bcaeb))

<a name="1.0.0-beta.21"></a>

# [1.0.0-beta.21](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2018-07-22)

### Bug Fixes

- extend extended child components ([#757](https://github.com/vuejs/vue-test-utils/issues/757)) ([bc5aba3](https://github.com/vuejs/vue-test-utils/commit/bc5aba3))
- improve scopedSlots option ([#808](https://github.com/vuejs/vue-test-utils/issues/808)) ([b946997](https://github.com/vuejs/vue-test-utils/commit/b946997))
- improve slots option ([#813](https://github.com/vuejs/vue-test-utils/issues/813)) ([5fecbd2](https://github.com/vuejs/vue-test-utils/commit/5fecbd2))

### Features

- add parentComponent option ([#846](https://github.com/vuejs/vue-test-utils/issues/846)) ([1951409](https://github.com/vuejs/vue-test-utils/commit/1951409))
- enabled slots option to take class components ([#826](https://github.com/vuejs/vue-test-utils/issues/826)) ([4916fed](https://github.com/vuejs/vue-test-utils/commit/4916fed))

<a name="1.0.0-beta.20"></a>

# [1.0.0-beta.20](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2018-06-24)

### Bug Fixes

- stub child components ([#723](https://github.com/vuejs/vue-test-utils/issues/723)) ([bc736fb](https://github.com/vuejs/vue-test-utils/commit/bc736fb))
- **slots:** functional component text slots ([#733](https://github.com/vuejs/vue-test-utils/issues/733)) ([daa56aa](https://github.com/vuejs/vue-test-utils/commit/daa56aa))

<a name="1.0.0-beta.19"></a>

# [1.0.0-beta.19](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2018-06-14)

### Bug Fixes

- handle extended components correctly ([#709](https://github.com/vuejs/vue-test-utils/issues/709)) ([55d831f](https://github.com/vuejs/vue-test-utils/commit/55d831f))
- support text slots ([#711](https://github.com/vuejs/vue-test-utils/issues/711)) ([93b8d98](https://github.com/vuejs/vue-test-utils/commit/93b8d98))

<a name="1.0.0-beta.17"></a>

# [1.0.0-beta.17](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2018-06-09)

### Bug Fixes

- clone propsData to avoid mutation ([#613](https://github.com/vuejs/vue-test-utils/issues/613)) ([a93275c](https://github.com/vuejs/vue-test-utils/commit/a93275c))
- make component construct correctly which class extends from Vue ([#654](https://github.com/vuejs/vue-test-utils/issues/654)) ([3ecce2e](https://github.com/vuejs/vue-test-utils/commit/3ecce2e))
- message for logModifiedComponents ([#597](https://github.com/vuejs/vue-test-utils/issues/597)) ([dea5dba](https://github.com/vuejs/vue-test-utils/commit/dea5dba))
- remove phantomjs limitation ([#663](https://github.com/vuejs/vue-test-utils/issues/663)) ([e9f3305](https://github.com/vuejs/vue-test-utils/commit/e9f3305))

### Features

- add parent in create-instance ([#586](https://github.com/vuejs/vue-test-utils/issues/586)) ([0ab5a75](https://github.com/vuejs/vue-test-utils/commit/0ab5a75))
- support component slot string ([#633](https://github.com/vuejs/vue-test-utils/issues/633)) ([8294453](https://github.com/vuejs/vue-test-utils/commit/8294453))

### BREAKING CHANGES

- removes templates from slots

<a name="1.0.0"></a>

# [1.0.0](https://github.com/EddYerburgh/vue-test-utils/compare/v1.0.0-beta.13...v1.0.0) (2018-03-01)

**Note:** Version bump only for package create-instance
