// @flow

import type Wrapper from '~src/Wrapper'
import type WrapperArray from '~src/WrapperArray'

declare type Selector = any
declare type Components = { [name: string]: Component }

declare interface BaseWrapper {
  // eslint-disable-line no-undef
  at(index: number): Wrapper | void;
  attributes(key?: string): { [name: string]: string } | string | void;
  classes(className?: string): Array<string> | boolean | void;
  contains(selector: Selector): boolean | void;
  emitted(
    event?: string
  ): { [name: string]: Array<Array<any>> } | Array<Array<any>> | void;
  emittedByOrder(): Array<{ name: string, args: Array<any> }> | void;
  exists(): boolean;
  filter(predicate: Function): WrapperArray | void;
  find(selector: Selector): Wrapper | void;
  findAll(selector: Selector): WrapperArray | void;
  html(): string | void;
  is(selector: Selector): boolean | void;
  isEmpty(): boolean | void;
  isVisible(): boolean | void;
  isVueInstance(): boolean | void;
  name(): string | void;
  overview(): void;
  props(key?: string): { [name: string]: any } | any | void;
  text(): string | void;
  selector: Selector | void;
  setData(data: Object): void;
  setMethods(methods: Object): void;
  setValue(value: any): void;
  setChecked(checked?: boolean): void;
  setSelected(): void;
  setProps(data: Object): void;
  trigger(type: string, options: Object): void;
  destroy(): void;
}

declare type WrapperOptions = {
  // eslint-disable-line no-undef
  attachedToDocument?: boolean
}
