# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.0.0-beta.19"></a>
# [1.0.0-beta.19](https://github.com/vuejs/vue-test-utils/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2018-06-14)


### Bug Fixes

* add stubbed components to ignored elements ([#714](https://github.com/vuejs/vue-test-utils/issues/714)) ([5072274](https://github.com/vuejs/vue-test-utils/commit/5072274))
* handle extended components correctly ([#709](https://github.com/vuejs/vue-test-utils/issues/709)) ([55d831f](https://github.com/vuejs/vue-test-utils/commit/55d831f))
* include default props in props object ([#716](https://github.com/vuejs/vue-test-utils/issues/716)) ([5bcf574](https://github.com/vuejs/vue-test-utils/commit/5bcf574))
* support text slots ([#711](https://github.com/vuejs/vue-test-utils/issues/711)) ([93b8d98](https://github.com/vuejs/vue-test-utils/commit/93b8d98))
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
* clone propsData to avoid mutation ([#613](https://github.com/vuejs/vue-test-utils/issues/613)) ([a93275c](https://github.com/vuejs/vue-test-utils/commit/a93275c))
* compile extended components ([#637](https://github.com/vuejs/vue-test-utils/issues/637)) ([e1fb4a0](https://github.com/vuejs/vue-test-utils/commit/e1fb4a0))
* do not deep merge array data ([#604](https://github.com/vuejs/vue-test-utils/issues/604)) ([934745b](https://github.com/vuejs/vue-test-utils/commit/934745b))
* docs link to wrapper ([#601](https://github.com/vuejs/vue-test-utils/issues/601)) ([fbd8b92](https://github.com/vuejs/vue-test-utils/commit/fbd8b92))
* make component construct correctly which class extends from Vue ([#654](https://github.com/vuejs/vue-test-utils/issues/654)) ([3ecce2e](https://github.com/vuejs/vue-test-utils/commit/3ecce2e))
* message for logModifiedComponents ([#597](https://github.com/vuejs/vue-test-utils/issues/597)) ([dea5dba](https://github.com/vuejs/vue-test-utils/commit/dea5dba))
* **types:** add render() ([#618](https://github.com/vuejs/vue-test-utils/issues/618)) ([f5d4a0f](https://github.com/vuejs/vue-test-utils/commit/f5d4a0f))
* method should be updated when triggering ([3922ab7](https://github.com/vuejs/vue-test-utils/commit/3922ab7))
* remove includes and findIndex ([#610](https://github.com/vuejs/vue-test-utils/issues/610)) ([a70a887](https://github.com/vuejs/vue-test-utils/commit/a70a887))
* remove phantomjs limitation ([#663](https://github.com/vuejs/vue-test-utils/issues/663)) ([e9f3305](https://github.com/vuejs/vue-test-utils/commit/e9f3305))
* remove throw from errorHandler ([#655](https://github.com/vuejs/vue-test-utils/issues/655)) ([b4517ab](https://github.com/vuejs/vue-test-utils/commit/b4517ab))
* type definition of classes method ([#685](https://github.com/vuejs/vue-test-utils/issues/685)) ([a864ed3](https://github.com/vuejs/vue-test-utils/commit/a864ed3))
* Update links to docs ([#670](https://github.com/vuejs/vue-test-utils/issues/670)) ([2f162e6](https://github.com/vuejs/vue-test-utils/commit/2f162e6)), closes [#3](https://github.com/vuejs/vue-test-utils/issues/3)
* use regex to test for circular references ([#672](https://github.com/vuejs/vue-test-utils/issues/672)) ([6a40f8a](https://github.com/vuejs/vue-test-utils/commit/6a40f8a))


### Features

* add parent in create-instance ([#586](https://github.com/vuejs/vue-test-utils/issues/586)) ([0ab5a75](https://github.com/vuejs/vue-test-utils/commit/0ab5a75))
* Add setValue method ([#557](https://github.com/vuejs/vue-test-utils/issues/557)) ([b4331ff](https://github.com/vuejs/vue-test-utils/commit/b4331ff))
* overwrite arrays in setData ([#652](https://github.com/vuejs/vue-test-utils/issues/652)) ([032a7a4](https://github.com/vuejs/vue-test-utils/commit/032a7a4))
* render component name in stub ([#606](https://github.com/vuejs/vue-test-utils/issues/606)) ([dbf63bb](https://github.com/vuejs/vue-test-utils/commit/dbf63bb))
* support component slot string ([#633](https://github.com/vuejs/vue-test-utils/issues/633)) ([8294453](https://github.com/vuejs/vue-test-utils/commit/8294453))


### BREAKING CHANGES

* removes templates from slots
