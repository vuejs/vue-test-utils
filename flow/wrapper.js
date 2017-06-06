import type Wrapper from '../src/Wrapper';
import type WrapperArray from '../src/WrapperArray';

declare interface WrapperInterface {
    at(index: number): Wrapper,
    contains(selector: String | Component): boolean,
    hasAttribute(attribute: string, value: string): boolean,
    hasClass(className: string): boolean,
    hasProp(prop: string, value: string): boolean,
    hasStyle(style: string, value: string): boolean,
    find(selector: string | Component): Wrapper,
    findAll(selector: string | Component): WrapperArray,
    html(): string,
    is(selector: string | Component): boolean,
    isEmpty(): boolean,
    isVueInstance(): boolean,
    name(): string,
    text(): string,
    setData(data: Object): void,
    setProps(data: Object): void,
    trigger(type: string): void,
    update(): void
}