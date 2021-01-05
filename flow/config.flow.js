declare type Config = {
  stubs?: { [name: string]: Component | boolean | string },
  mocks?: Object,
  methods?: { [name: string]: Function },
  provide?: Object,
  showDeprecationWarnings?: boolean
}
