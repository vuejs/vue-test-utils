# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.0.0-beta.25"></a>
# [1.0.0-beta.25](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2018-09-08)


### Bug Fixes

* handle global stubs and functional extended components ([#943](https://github.com/vuejs/vue-test-utils/issues/943)) ([0d1ddd1](https://github.com/vuejs/vue-test-utils/commit/0d1ddd1))
* improve emitted type ([#933](https://github.com/vuejs/vue-test-utils/issues/933)) ([3049c3e](https://github.com/vuejs/vue-test-utils/commit/3049c3e))
* throw error if unsupported options passed in vue < 2.3 ([#910](https://github.com/vuejs/vue-test-utils/issues/910)) ([e8d9547](https://github.com/vuejs/vue-test-utils/commit/e8d9547))


### Features

* **wrapper:** add support for getting prop, attribute and classes by key ([#941](https://github.com/vuejs/vue-test-utils/issues/941)) ([9bb9a87](https://github.com/vuejs/vue-test-utils/commit/9bb9a87))


### Performance Improvements

* use extends over createLocalVue ([#934](https://github.com/vuejs/vue-test-utils/issues/934)) ([af45a9d](https://github.com/vuejs/vue-test-utils/commit/af45a9d))




<a name="1.0.0-beta.24"></a>
# [1.0.0-beta.24](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2018-08-05)


### Bug Fixes

* handle null in set data ([#896](https://github.com/vuejs/vue-test-utils/issues/896)) ([44c4520](https://github.com/vuejs/vue-test-utils/commit/44c4520))
* wrap extended child components ([#840](https://github.com/vuejs/vue-test-utils/issues/840)) ([4faf5fb](https://github.com/vuejs/vue-test-utils/commit/4faf5fb))




<a name="1.0.0-beta.23"></a>
# [1.0.0-beta.23](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.22...v1.0.0-beta.23) (2018-07-31)




**Note:** Version bump only for package @vue/test-utils

<a name="1.0.0-beta.22"></a>
# [1.0.0-beta.22](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.21...v1.0.0-beta.22) (2018-07-29)


### Bug Fixes

* stub globally registered components ([#859](https://github.com/vuejs/vue-test-utils/issues/859)) ([5af3677](https://github.com/vuejs/vue-test-utils/commit/5af3677))
* support multiple default slot nodes ([#861](https://github.com/vuejs/vue-test-utils/issues/861)) ([85dd3ec](https://github.com/vuejs/vue-test-utils/commit/85dd3ec))


### Features

* export createWrapper method to create wrapper from instance ([#868](https://github.com/vuejs/vue-test-utils/issues/868)) ([ebca3b3](https://github.com/vuejs/vue-test-utils/commit/ebca3b3))
* export wrapper class ([#866](https://github.com/vuejs/vue-test-utils/issues/866)) ([c212ebf](https://github.com/vuejs/vue-test-utils/commit/c212ebf))




<a name="1.0.0-beta.21"></a>
# [1.0.0-beta.21](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2018-07-22)


### Bug Fixes

* handle textarea correctly in setValue() and setChecked() ([#771](https://github.com/vuejs/vue-test-utils/issues/771)) ([4c9fe3c](https://github.com/vuejs/vue-test-utils/commit/4c9fe3c))
* **types:** remove unnecessary method ([#755](https://github.com/vuejs/vue-test-utils/issues/755)) ([2068208](https://github.com/vuejs/vue-test-utils/commit/2068208))
* broken links for deprecated methods ([#786](https://github.com/vuejs/vue-test-utils/issues/786)) ([5bb6a0b](https://github.com/vuejs/vue-test-utils/commit/5bb6a0b))
* fix type of wrapper.vm ([#759](https://github.com/vuejs/vue-test-utils/issues/759)) ([ff5220d](https://github.com/vuejs/vue-test-utils/commit/ff5220d))
* handle cloneDeep errors in createLocalVue ([#844](https://github.com/vuejs/vue-test-utils/issues/844)) ([17dfdc8](https://github.com/vuejs/vue-test-utils/commit/17dfdc8))
* handle unnamed parent and child components ([#768](https://github.com/vuejs/vue-test-utils/issues/768)) ([71a2ac4](https://github.com/vuejs/vue-test-utils/commit/71a2ac4))
* improve scopedSlots option ([#808](https://github.com/vuejs/vue-test-utils/issues/808)) ([b946997](https://github.com/vuejs/vue-test-utils/commit/b946997))
* recursively call Vue.set in setData ([#843](https://github.com/vuejs/vue-test-utils/issues/843)) ([ef01abf](https://github.com/vuejs/vue-test-utils/commit/ef01abf))
* setProps() throws an error if the property is the same reference ([#791](https://github.com/vuejs/vue-test-utils/issues/791)) ([bf655f3](https://github.com/vuejs/vue-test-utils/commit/bf655f3))
* stubs extended component correctly ([#767](https://github.com/vuejs/vue-test-utils/issues/767)) ([24ab4c5](https://github.com/vuejs/vue-test-utils/commit/24ab4c5))
* support setValue on textarea ([#764](https://github.com/vuejs/vue-test-utils/issues/764)) ([e83cda2](https://github.com/vuejs/vue-test-utils/commit/e83cda2))
* update props when watcher depends on value ([#842](https://github.com/vuejs/vue-test-utils/issues/842)) ([2aeaee3](https://github.com/vuejs/vue-test-utils/commit/2aeaee3))
* use boolean for VueWrapper ([#763](https://github.com/vuejs/vue-test-utils/issues/763)) ([6fa6ecd](https://github.com/vuejs/vue-test-utils/commit/6fa6ecd))


### Features

* add parentComponent option ([#846](https://github.com/vuejs/vue-test-utils/issues/846)) ([1951409](https://github.com/vuejs/vue-test-utils/commit/1951409))
* use setValue() on select element ([#837](https://github.com/vuejs/vue-test-utils/issues/837)) ([2e6de7b](https://github.com/vuejs/vue-test-utils/commit/2e6de7b))




<a name="1.0.0-beta.20"></a>
# [1.0.0-beta.20](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2018-06-24)


### Bug Fixes

* force update in setProps ([#752](https://github.com/vuejs/vue-test-utils/issues/752)) ([7e23e09](https://github.com/vuejs/vue-test-utils/commit/7e23e09))
* stub child components ([#723](https://github.com/vuejs/vue-test-utils/issues/723)) ([bc736fb](https://github.com/vuejs/vue-test-utils/commit/bc736fb))


### Features

* element, vnode, vm, and options are read-only ([#748](https://github.com/vuejs/vue-test-utils/issues/748)) ([b801c25](https://github.com/vuejs/vue-test-utils/commit/b801c25))
* set wrapper.vm if the element binds Vue instance ([#724](https://github.com/vuejs/vue-test-utils/issues/724)) ([b14afae](https://github.com/vuejs/vue-test-utils/commit/b14afae))
* throw error if the read-only property is tried to change ([#749](https://github.com/vuejs/vue-test-utils/issues/749)) ([fb46268](https://github.com/vuejs/vue-test-utils/commit/fb46268))




<a name="1.0.0-beta.19"></a>
# [1.0.0-beta.19](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2018-06-14)


### Bug Fixes

* include default props in props object ([#716](https://github.com/vuejs/vue-test-utils/issues/716)) ([5bcf574](https://github.com/vuejs/vue-test-utils/commit/5bcf574))
* wrapper.setSelected() to work on select with optgroups ([#715](https://github.com/vuejs/vue-test-utils/issues/715)) ([dae0b1c](https://github.com/vuejs/vue-test-utils/commit/dae0b1c))


### Features

* silence warnings when updating prop ([#688](https://github.com/vuejs/vue-test-utils/issues/688)) ([7fa2fb3](https://github.com/vuejs/vue-test-utils/commit/7fa2fb3))




<a name="1.0.0-beta.18"></a>
# [1.0.0-beta.18](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2018-06-09)


### Bug Fixes

* update context after setMethods ([#696](https://github.com/vuejs/vue-test-utils/issues/696)) ([0590b4c](https://github.com/vuejs/vue-test-utils/commit/0590b4c))




<a name="1.0.0-beta.17"></a>
# [1.0.0-beta.17](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2018-06-09)


### Bug Fixes

* add updated hook ([#675](https://github.com/vuejs/vue-test-utils/issues/675)) ([9a2a25a](https://github.com/vuejs/vue-test-utils/commit/9a2a25a)), closes [#661](https://github.com/vuejs/vue-test-utils/issues/661)
* do not deep merge array data ([#604](https://github.com/vuejs/vue-test-utils/issues/604)) ([934745b](https://github.com/vuejs/vue-test-utils/commit/934745b))
* method should be updated when triggering ([3922ab7](https://github.com/vuejs/vue-test-utils/commit/3922ab7))
* remove includes and findIndex ([#610](https://github.com/vuejs/vue-test-utils/issues/610)) ([a70a887](https://github.com/vuejs/vue-test-utils/commit/a70a887))
* remove throw from errorHandler ([#655](https://github.com/vuejs/vue-test-utils/issues/655)) ([b4517ab](https://github.com/vuejs/vue-test-utils/commit/b4517ab))
* type definition of classes method ([#685](https://github.com/vuejs/vue-test-utils/issues/685)) ([a864ed3](https://github.com/vuejs/vue-test-utils/commit/a864ed3))
* Update links to docs ([#670](https://github.com/vuejs/vue-test-utils/issues/670)) ([2f162e6](https://github.com/vuejs/vue-test-utils/commit/2f162e6)), closes [#3](https://github.com/vuejs/vue-test-utils/issues/3)


### Features

* add parent in create-instance ([#586](https://github.com/vuejs/vue-test-utils/issues/586)) ([0ab5a75](https://github.com/vuejs/vue-test-utils/commit/0ab5a75))
* Add setValue method ([#557](https://github.com/vuejs/vue-test-utils/issues/557)) ([b4331ff](https://github.com/vuejs/vue-test-utils/commit/b4331ff))
* overwrite arrays in setData ([#652](https://github.com/vuejs/vue-test-utils/issues/652)) ([032a7a4](https://github.com/vuejs/vue-test-utils/commit/032a7a4))
* render component name in stub ([#606](https://github.com/vuejs/vue-test-utils/issues/606)) ([dbf63bb](https://github.com/vuejs/vue-test-utils/commit/dbf63bb))


### BREAKING CHANGES

* removes templates from slots
