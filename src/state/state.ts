import { ListenerFn } from "./types/state";

export abstract class State<T> {
  protected listeners: ListenerFn<T>[] = [];

  addListener(listenerFn: ListenerFn<T>) {
    this.listeners.push(listenerFn);
  }
}
