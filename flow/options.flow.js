declare type Options = {
  // eslint-disable-line no-undef
  attachToDocument?: boolean,
  propsData?: Object,
  mocks?: Object,
  methods?: { [key: string]: Function },
  slots?: SlotsObject,
  scopedSlots?: { [key: string]: string },
  localVue?: Component,
  provide?: Object,
  stubs?: Stubs,
  context?: Object,
  attrs?: { [key: string]: string },
  listeners?: { [key: string]: Function | Function[] },
  logModifiedComponents?: boolean,
  sync?: boolean
};

declare type SlotValue = Component | string | Array<Component | string>;

declare type SlotsObject = { [name: string]: SlotValue };

declare type Stubs = {
  [name: string]: Component | true | string
} | Array<string>
