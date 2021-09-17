import { ProjectStatus } from "../models/project";

export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  protected constructor(tplId: string,
                        hostId: string,
                        private elPosition: InsertPosition,
                        type?: ProjectStatus) {
    this.templateEl = document.querySelector(`#${tplId}`)!;
    this.hostEl = document.querySelector(`#${hostId}`)!;
    this.element = document.importNode(this.templateEl.content, true).firstElementChild as U;

    if (type) {
      this.element.id = `${type}-projects`;
    }

    this.attach();
  }

  abstract configure(): void;
  abstract renderContent(): void;

  protected attach() {
    this.hostEl.insertAdjacentElement(this.elPosition, this.element);
  }
}