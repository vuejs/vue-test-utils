declare type Options = {
  // eslint-disable-line no-undef
  attachToDocument?: boolean,
  propsData?: Object,
  mocks?: Object,
  methods?: { [key: string]: Function },
  slots?: SlotsObject,
  scopedSlots?: { [key: string]: string | Function },
  localVue?: Component,
  provide?: Object,
  stubs?: Stubs,
  context?: Object,
  attrs?: { [key: string]: string },
  listeners?: { [key: string]: Function | Array<Function> },
  parentComponent?: Object,
  logModifiedComponents?: boolean,
  sync?: boolean,
  shouldProxy?: boolean
}

declare type NormalizedOptions = {
  attachToDocument?: boolean,
  propsData?: Object,
  mocks: Object,
  methods: { [key: string]: Function },
  slots?: SlotsObject,
  scopedSlots?: { [key: string]: string | Function },
  localVue?: Component,
  provide?: Object | Function,
  stubs: { [name: string]: Component | true | string },
  context?: Object,
  attrs?: { [key: string]: string },
  listeners?: { [key: string]: Function | Array<Function> },
  parentComponent?: Object,
  logModifiedComponents?: boolean,
  sync: boolean,
  shouldProxy?: boolean
}

declare type SlotValue = Component | string | Array<Component | string>

declare type SlotsObject = { [name: string]: SlotValue }

declare type Stubs =
  | {
      [name: string]: Component | true | string
    }
  | Array<string>
