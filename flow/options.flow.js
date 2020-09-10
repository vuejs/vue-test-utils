declare type Options = {
  // eslint-disable-line no-undef
  attachToDocument?: boolean,
  attachTo?: HTMLElement | string,
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
  shouldProxy?: boolean
}

declare type NormalizedOptions = {
  attachTo?: HTMLElement | string,
  attachToDocument?: boolean,
  propsData?: Object,
  mocks: Object,
  methods: { [key: string]: Function },
  slots?: SlotsObject,
  scopedSlots?: { [key: string]: string | Function },
  localVue?: Component,
  provide?: Object | Function,
  stubs: { [name: string]: Component | true | string } | boolean,
  context?: Object,
  attrs?: { [key: string]: string },
  listeners?: { [key: string]: Function | Array<Function> },
  parentComponent?: Object,
  sync: boolean,
  shouldProxy?: boolean
}

declare type VueConfig = {
  errorHandler?: Function
}

declare type SlotValue = Component | string | Array<Component | string>

declare type SlotsObject = { [name: string]: SlotValue }

declare type Stubs =
  | {
      [name: string]: Component | true | string
    }
  | Array<string>
