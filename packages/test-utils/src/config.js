export default {
  stubs: {
    transition: true,
    'transition-group': true
  },
  mocks: {},
  methods: {},
  provide: {},
  silent: true,
  showDeprecationWarnings:
    typeof process.env.SHOW_DEPRECATIONS !== 'undefined'
      ? process.env.SHOW_DEPRECATIONS
      : true
}
