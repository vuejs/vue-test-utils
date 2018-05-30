declare type Options = { // eslint-disable-line no-undef
    attachToDocument?: boolean,
    propsData?: Object,
    mocks?: Object,
    methods?: Object,
    slots?: Object,
    scopedSlots?: Object,
    localVue?: Component,
    provide?: Object,
    stubs?: Object,
    context?: Object,
    attrs?: Object,
    listeners?: Object,
    logModifiedComponents?: boolean,
    sync?: boolean
}

declare type SlotValue = Component | string | Array<Component | string>

declare type SlotsObject = {[name: string]: SlotValue}
