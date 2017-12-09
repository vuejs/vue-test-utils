// @flow

import type Wrapper from '~src/Wrapper'
import type WrapperArray from '~src/WrapperArray'

declare type Selector = any

declare interface BaseWrapper { // eslint-disable-line no-undef
    at(index: number): Wrapper | void,
    contains(selector: Selector): boolean | void,
    emitted(): { [name: string]: Array<Array<any>> } | void,
    emittedByOrder(): Array<{ name: string; args: Array<any> }> | void,
    exists(): boolean,
    hasAttribute(attribute: string, value: string): boolean | void,
    hasClass(className: string): boolean | void,
    hasProp(prop: string, value: string): boolean | void,
    hasStyle(style: string, value: string): boolean | void,
    find(selector: Selector): Wrapper | void,
    findAll(selector: Selector): WrapperArray | void,
    html(): string | void,
    is(selector: Selector): boolean | void,
    isEmpty(): boolean | void,
    isVueInstance(): boolean | void,
    name(): string | void,
    text(): string | void,
    setData(data: Object): void,
    setComputed(computed: Object): void,
    setMethods(methods: Object): void,
    setProps(data: Object): void,
    trigger(type: string, options: Object): void,
    update(): void,
    destroy(): void
}

declare type WrapperOptions = { // eslint-disable-line no-undef
    attachedToDocument: boolean,
    error?: string
}
