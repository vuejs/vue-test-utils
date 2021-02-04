# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.3](https://github.com/vuejs/vue-test-utils/compare/v1.1.2...v1.1.3) (2021-02-04)


### Bug Fixes

* prevent setProps infinite loop with immediate watchers ([#1752](https://github.com/vuejs/vue-test-utils/issues/1752)) ([db4ab8b](https://github.com/vuejs/vue-test-utils/commit/db4ab8b10872ff1ca492c02ad0f62368ed748631))





## [1.0.5](https://github.com/vuejs/vue-test-utils/compare/v1.0.4...v1.0.5) (2020-08-29)


### Bug Fixes

* extend Vue parent with options to support accessing root. with VCA ([#1661](https://github.com/vuejs/vue-test-utils/issues/1661)) ([f78f817](https://github.com/vuejs/vue-test-utils/commit/f78f817306e2e228319092e3d3de55fc4356aa93))
* handle shallowMount on components with v-if and scoped slots ([#1663](https://github.com/vuejs/vue-test-utils/issues/1663)) ([41f2b2b](https://github.com/vuejs/vue-test-utils/commit/41f2b2b18cb0d557bf36a5a28cf769a02dba931f))





## [1.0.4](https://github.com/vuejs/vue-test-utils/compare/v1.0.3...v1.0.4) (2020-08-17)

**Note:** Version bump only for package create-instance





# [1.0.0](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.33...v1.0.0) (2020-05-05)


### Features

* Optionally hide deprecation errors ([#1518](https://github.com/vuejs/vue-test-utils/issues/1518)) ([7a0b7e0](https://github.com/vuejs/vue-test-utils/commit/7a0b7e0c695da901f22df2fea53f6fef5e4dadf7))





# [1.0.0-beta.33](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.32...v1.0.0-beta.33) (2020-04-08)


### Bug Fixes

* **create-instance:** revert stubbing of component _Ctor ([#1479](https://github.com/vuejs/vue-test-utils/issues/1479)) ([70b553b](https://github.com/vuejs/vue-test-utils/commit/70b553bd18158d82de5f26ff14c1f062be371245))
* Add v-slot support in scopedSlots property, fix [#1457](https://github.com/vuejs/vue-test-utils/issues/1457) ([#1485](https://github.com/vuejs/vue-test-utils/issues/1485)) ([4df7619](https://github.com/vuejs/vue-test-utils/commit/4df7619c9388528718f0a39704fd22bd6dd669af))


### Features

* support object class binding in stubbed functional components ([#1476](https://github.com/vuejs/vue-test-utils/issues/1476)) ([55f7eac](https://github.com/vuejs/vue-test-utils/commit/55f7eac5cd305b60c0b9f8340cc6d9e3f470a665))





# [1.0.0-beta.32](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.31...v1.0.0-beta.32) (2020-03-09)


### Bug Fixes

* stub globally registered components ([#1441](https://github.com/vuejs/vue-test-utils/issues/1441)) ([228cd1a](https://github.com/vuejs/vue-test-utils/commit/228cd1ad4c578d71a0d05e7d7e491ce8b90229a9)), closes [#1272](https://github.com/vuejs/vue-test-utils/issues/1272)





# [1.0.0-beta.31](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.30...v1.0.0-beta.31) (2020-01-18)


### Bug Fixes

* Override watch definitions properly ([#1392](https://github.com/vuejs/vue-test-utils/pull/1392)) closes [#1391](https://github.com/vuejs/vue-test-utils/issues/1391)
* Support v-slot ([#1383](https://github.com/vuejs/vue-test-utils/pull/1383)) closes [#1261](https://github.com/vuejs/vue-test-utils/issues/1261)
* Add a get method to Wrapper ([#1304](https://github.com/vuejs/vue-test-utils/pull/1304)) closes [#1298](https://github.com/vuejs/vue-test-utils/issues/1298)
* Pass refs to functional component stubs [#1293](https://github.com/vuejs/vue-test-utils/pull/1293) closes [#1292](https://github.com/vuejs/vue-test-utils/issues/1292)



<a name="1.0.0-beta.30"></a>
# [1.0.0-beta.30](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.29...v1.0.0-beta.30) (2019-11-28)


### Bug Fixes

* add $set scoped slot helper ([#1287](https://github.com/vuejs/vue-test-utils/issues/1287)) ([a9eea7b](https://github.com/vuejs/vue-test-utils/commit/a9eea7b)), closes [#1253](https://github.com/vuejs/vue-test-utils/issues/1253)
* stub model option ([#1166](https://github.com/vuejs/vue-test-utils/issues/1166)) ([f81695b](https://github.com/vuejs/vue-test-utils/commit/f81695b))


### Code Refactoring

* remove sync mode ([#1141](https://github.com/vuejs/vue-test-utils/issues/1141)) ([ef613de](https://github.com/vuejs/vue-test-utils/commit/ef613de))


### Features

* stop auto stubbing transition and transition-group ([#1127](https://github.com/vuejs/vue-test-utils/issues/1127)) ([85a972c](https://github.com/vuejs/vue-test-utils/commit/85a972c))


### BREAKING CHANGES

* * Remove `sync` mode
* Remove TransitionStub
* Remove Transition




<a name="1.0.0-beta.29"></a>
# [1.0.0-beta.29](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.28...v1.0.0-beta.29) (2019-02-02)


### Bug Fixes

* handle errors in destroy ([#1106](https://github.com/vuejs/vue-test-utils/issues/1106)) ([efab983](https://github.com/vuejs/vue-test-utils/commit/efab983))
* handle options applied by mixins ([#1101](https://github.com/vuejs/vue-test-utils/issues/1101)) ([d2f26e8](https://github.com/vuejs/vue-test-utils/commit/d2f26e8))
* use Vue async option for sync mode ([#1062](https://github.com/vuejs/vue-test-utils/issues/1062)) ([4c65dbd](https://github.com/vuejs/vue-test-utils/commit/4c65dbd))




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
