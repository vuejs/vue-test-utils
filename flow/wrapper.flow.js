// @flow

import type Wrapper from '~src/Wrapper'
import type WrapperArray from '~src/WrapperArray'

declare type Selector = any

declare interface BaseWrapper { // eslint-disable-line no-undef
    at(index: number): Wrapper | void,
    attributes(): { [name: string]: string } | void,
    classes(): Array<string> | void,
    contains(selector: Selector): boolean | void,
    emitted(event?: string): { [name: string]: Array<Array<any>> } | Array<Array<any>> | void,
    emittedByOrder(): Array<{ name: string; args: Array<any> }> | void,
    exists(): boolean,
    filter(predicate: Function): WrapperArray | void,
    visible(): boolean | void,
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
    props(): { [name: string]: any } | void,
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
