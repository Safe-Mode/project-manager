import { DragTarget } from "../models/drag-and-drop";
import { AutoBind } from "../utils/decorators/auto-bind";
import { Component } from "./base-component";
import { Project, ProjectStatus } from "../models/project";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  projectsListEl: HTMLUListElement;
  projects: Project[] = [];

  constructor(private type: ProjectStatus) {
    super('project-list', 'app', 'beforeend', type);

    this.projectsListEl = this.element.querySelector('ul')!;
    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragOverHandler(evt: DragEvent) {
    if (evt.dataTransfer && evt.dataTransfer.types[0] === 'text/plain') {
      evt.preventDefault();
      this.projectsListEl.classList.add('droppable');
    }
  }

  @AutoBind
  dragLeaveHandler(_: DragEvent) {
    this.projectsListEl.classList.remove('droppable');
  }

  @AutoBind
  dropHandler(evt: DragEvent) {
    projectState.moveProject(evt.dataTransfer!.getData('text/plain'), this.type);
  }

  configure() {
    this.projectsListEl.id = `${this.type}-projects-list`;

    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      this.projects = projects.filter((project) => (project.status === this.type));
      this.renderProjects();
    });
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = `${this.type} projects`.toUpperCase();
  }

  private renderProjects() {
    this.projectsListEl.innerHTML = '';

    for (const project of this.projects) {
      new ProjectItem(this.projectsListEl.id, project);
    }
  }
}
