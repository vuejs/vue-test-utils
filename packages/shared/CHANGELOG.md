# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.2](https://github.com/vuejs/vue-test-utils/compare/v1.0.1...v1.0.2) (2020-05-06)

**Note:** Version bump only for package shared





# [1.0.0](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.33...v1.0.0) (2020-05-05)


### Features

* add support of arbitrary mounting point via attachTo option ([#1492](https://github.com/vuejs/vue-test-utils/issues/1492)) ([f3d0d3f](https://github.com/vuejs/vue-test-utils/commit/f3d0d3f1717fd3cc3e406d3ac3f4ace316967211))
* Optionally hide deprecation errors ([#1518](https://github.com/vuejs/vue-test-utils/issues/1518)) ([7a0b7e0](https://github.com/vuejs/vue-test-utils/commit/7a0b7e0c695da901f22df2fea53f6fef5e4dadf7))
* return nextTick from setters, fix [#1515](https://github.com/vuejs/vue-test-utils/issues/1515) ([#1517](https://github.com/vuejs/vue-test-utils/issues/1517)) ([aa7b76d](https://github.com/vuejs/vue-test-utils/commit/aa7b76d5996a24bfaca74989907c0982fdeaa013))





# [1.0.0-beta.33](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.32...v1.0.0-beta.33) (2020-04-08)

**Note:** Version bump only for package shared





# [1.0.0-beta.32](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.31...v1.0.0-beta.32) (2020-03-09)

**Note:** Version bump only for package shared





# [1.0.0-beta.31](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.30...v1.0.0-beta.31) (2020-01-18)

**Note:** Version bump only for package shared





<a name="1.0.0-beta.30"></a>
# [1.0.0-beta.30](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.29...v1.0.0-beta.30) (2019-11-28)


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

* use Vue async option for sync mode ([#1062](https://github.com/vuejs/vue-test-utils/issues/1062)) ([4c65dbd](https://github.com/vuejs/vue-test-utils/commit/4c65dbd))




<a name="1.0.0-beta.28"></a>

# [1.0.0-beta.28](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.27...v1.0.0-beta.28) (2018-12-29)

### Bug Fixes

- use correct event type for checkbox v-model handler ([#1083](https://github.com/vuejs/vue-test-utils/issues/1083)) ([ef66c26](https://github.com/vuejs/vue-test-utils/commit/ef66c26))

<a name="1.0.0-beta.27"></a>

# [1.0.0-beta.27](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.26...v1.0.0-beta.27) (2018-12-09)

### Bug Fixes

- stop stubs leaking with localVue ([#1056](https://github.com/vuejs/vue-test-utils/issues/1056)) ([5500553](https://github.com/vuejs/vue-test-utils/commit/5500553))

<a name="1.0.0-beta.26"></a>

# [1.0.0-beta.26](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2018-11-26)

### Bug Fixes

- create stubs in render ([#1038](https://github.com/vuejs/vue-test-utils/issues/1038)) ([e1fd705](https://github.com/vuejs/vue-test-utils/commit/e1fd705)), closes [#973](https://github.com/vuejs/vue-test-utils/issues/973) [#994](https://github.com/vuejs/vue-test-utils/issues/994) [#995](https://github.com/vuejs/vue-test-utils/issues/995)
- do not remove cached constructors ([#962](https://github.com/vuejs/vue-test-utils/issues/962)) ([71ec3b9](https://github.com/vuejs/vue-test-utils/commit/71ec3b9))
- support async components in stubs ([#1039](https://github.com/vuejs/vue-test-utils/issues/1039)) ([6a4e19d](https://github.com/vuejs/vue-test-utils/commit/6a4e19d)), closes [#1026](https://github.com/vuejs/vue-test-utils/issues/1026)

### Features

- support lazily added components ([#1005](https://github.com/vuejs/vue-test-utils/issues/1005)) ([3653c60](https://github.com/vuejs/vue-test-utils/commit/3653c60))

### BREAKING CHANGES

- The tag name rendered by snapshots will use the rendered component tag, rather than the registered component name

<a name="1.0.0-beta.25"></a>

# [1.0.0-beta.25](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2018-09-08)

### Bug Fixes

- render all children ([#931](https://github.com/vuejs/vue-test-utils/issues/931)) ([71a2e7b](https://github.com/vuejs/vue-test-utils/commit/71a2e7b))
- throw error if unsupported options passed in vue < 2.3 ([#910](https://github.com/vuejs/vue-test-utils/issues/910)) ([e8d9547](https://github.com/vuejs/vue-test-utils/commit/e8d9547))

<a name="1.0.0-beta.24"></a>

# [1.0.0-beta.24](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2018-08-05)

### Bug Fixes

- render classes of functional component stubs ([#898](https://github.com/vuejs/vue-test-utils/issues/898)) ([11cfee2](https://github.com/vuejs/vue-test-utils/commit/11cfee2))
- wrap extended child components ([#840](https://github.com/vuejs/vue-test-utils/issues/840)) ([4faf5fb](https://github.com/vuejs/vue-test-utils/commit/4faf5fb))

<a name="1.0.0-beta.22"></a>

# [1.0.0-beta.22](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.21...v1.0.0-beta.22) (2018-07-29)

### Bug Fixes

- handle dynamic imports ([#864](https://github.com/vuejs/vue-test-utils/issues/864)) ([4e739bd](https://github.com/vuejs/vue-test-utils/commit/4e739bd))
- render children for functional component stubs ([#860](https://github.com/vuejs/vue-test-utils/issues/860)) ([e2e48dc](https://github.com/vuejs/vue-test-utils/commit/e2e48dc))
- stub globally registered components ([#859](https://github.com/vuejs/vue-test-utils/issues/859)) ([5af3677](https://github.com/vuejs/vue-test-utils/commit/5af3677))

### Features

- render props on auto stubs ([#834](https://github.com/vuejs/vue-test-utils/issues/834)) ([8db502d](https://github.com/vuejs/vue-test-utils/commit/8db502d))

<a name="1.0.0-beta.21"></a>

# [1.0.0-beta.21](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2018-07-22)

### Bug Fixes

- allow extended components as stubs ([#825](https://github.com/vuejs/vue-test-utils/issues/825)) ([65449b3](https://github.com/vuejs/vue-test-utils/commit/65449b3))
- recursively call Vue.set in setData ([#843](https://github.com/vuejs/vue-test-utils/issues/843)) ([ef01abf](https://github.com/vuejs/vue-test-utils/commit/ef01abf))
- stubs extended component correctly ([#767](https://github.com/vuejs/vue-test-utils/issues/767)) ([24ab4c5](https://github.com/vuejs/vue-test-utils/commit/24ab4c5))
- use for in to stub components on prototype ([#845](https://github.com/vuejs/vue-test-utils/issues/845)) ([b6a3659](https://github.com/vuejs/vue-test-utils/commit/b6a3659))

### Features

- add parentComponent option ([#846](https://github.com/vuejs/vue-test-utils/issues/846)) ([1951409](https://github.com/vuejs/vue-test-utils/commit/1951409))
- render slots by default ([#782](https://github.com/vuejs/vue-test-utils/issues/782)) ([1ad731e](https://github.com/vuejs/vue-test-utils/commit/1ad731e))

<a name="1.0.0-beta.20"></a>

# [1.0.0-beta.20](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2018-06-24)

**Note:** Version bump only for package shared

<a name="1.0.0-beta.19"></a>

# [1.0.0-beta.19](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2018-06-14)

### Bug Fixes

- add stubbed components to ignored elements ([#714](https://github.com/vuejs/vue-test-utils/issues/714)) ([5072274](https://github.com/vuejs/vue-test-utils/commit/5072274))

<a name="1.0.0-beta.17"></a>

# [1.0.0-beta.17](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2018-06-09)

### Bug Fixes

- compile extended components ([#637](https://github.com/vuejs/vue-test-utils/issues/637)) ([e1fb4a0](https://github.com/vuejs/vue-test-utils/commit/e1fb4a0))
- use regex to test for circular references ([#672](https://github.com/vuejs/vue-test-utils/issues/672)) ([6a40f8a](https://github.com/vuejs/vue-test-utils/commit/6a40f8a))

### Features

- add parent in create-instance ([#586](https://github.com/vuejs/vue-test-utils/issues/586)) ([0ab5a75](https://github.com/vuejs/vue-test-utils/commit/0ab5a75))
- render component name in stub ([#606](https://github.com/vuejs/vue-test-utils/issues/606)) ([dbf63bb](https://github.com/vuejs/vue-test-utils/commit/dbf63bb))

### BREAKING CHANGES

- removes templates from slots
