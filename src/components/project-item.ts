import { Draggable } from "../models/drag-and-drop";
import { AutoBind } from "../utils/decorators/auto-bind";
import { Component } from "./base-component";
import { Project } from "../models/project";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  constructor(listId: string,
              private project: Project) {
    super('single-project', listId, 'beforeend');

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(evt: DragEvent) {
    evt.dataTransfer!.setData('text/plain', this.project.id);
    evt.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(evt: DragEvent) {
    console.log(evt.type)
  }

  configure() {
    this.element.id = this.project.id;

    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.project.people} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
