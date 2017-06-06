// @flow

import type Wrapper from '../src/Wrapper'
import type WrapperArray from '../src/WrapperArray'

declare interface BaseWrapper { // eslint-disable-line no-undef
    at(index: number): Wrapper,
    contains(selector: String | Component): boolean,
    hasAttribute(attribute: string, value: string): boolean,
    hasClass(className: string): boolean,
    hasProp(prop: string, value: string): boolean,
    hasStyle(style: string, value: string): boolean,
    find(selector: string | Component): Wrapper | void,
    findAll(selector: string | Component): WrapperArray | void,
    html(): string | void,
    is(selector: string | Component): boolean,
    isEmpty(): boolean,
    isVueInstance(): boolean,
    name(): string | void,
    text(): string | void,
    setData(data: Object): void,
    setProps(data: Object): void,
    trigger(type: string): void,
    update(): void
}
