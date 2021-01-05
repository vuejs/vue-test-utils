export default {
  stubs: {
    transition: true,
    'transition-group': true
  },
  mocks: {},
  methods: {},
  provide: {},
  showDeprecationWarnings:
    typeof process.env.SHOW_DEPRECATIONS !== 'undefined'
      ? process.env.SHOW_DEPRECATIONS
      : true
}
