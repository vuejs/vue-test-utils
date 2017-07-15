// @flow

import type Wrapper from '~src/Wrapper'
import type WrapperArray from '~src/WrapperArray'

declare interface BaseWrapper { // eslint-disable-line no-undef
    at(index: number): Wrapper | void,
    contains(selector: String | Component): boolean | void,
    hasAttribute(attribute: string, value: string): boolean | void,
    hasClass(className: string): boolean | void,
    hasProp(prop: string, value: string): boolean | void,
    hasStyle(style: string, value: string): boolean | void,
    find(selector: string | Component): Wrapper | void,
    findAll(selector: string | Component): WrapperArray | void,
    html(): string | void,
    is(selector: string | Component): boolean | void,
    isEmpty(): boolean | void,
    isVueInstance(): boolean | void,
    name(): string | void,
    text(): string | void,
    setData(data: Object): void,
    setProps(data: Object): void,
    trigger(type: string, options: Object): void,
    update(): void
}

declare type WrapperOptions = { // eslint-disable-line no-undef
    attachedToDocument: boolean,
    error?: string
}
