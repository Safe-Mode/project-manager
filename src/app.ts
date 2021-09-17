// Validation
interface ValidationConfig {
  value: number | string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = ({ value, required, minLength, maxLength, min, max }: ValidationConfig): boolean => {
  let isValid = true;

  if (required) {
    isValid = isValid && !!value;
  }

  const isStringValue = typeof value === 'string';
  const isNumeric = typeof value === 'number' && !isNaN(value);

  if (isStringValue) {
    const stringLength = value?.toString().trim().length;

    if (minLength != null) {
      isValid = isValid && (stringLength >= minLength);
    }

    if (maxLength) {
      isValid = isValid && (stringLength <= maxLength);
    }
  }

  if (isNumeric) {
    if (min != null) {
      isValid = isValid && (value >= min);
    }

    if (max) {
      isValid = isValid && (value <= max);
    }
  }

  return isValid;
};

// Drag and drop
interface Draggable {
  dragStartHandler(evt: DragEvent): void;
  dragEndHandler(evt: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(evt: DragEvent): void;
  dragLeaveHandler(evt: DragEvent): void;
  dropHandler(evt: DragEvent): void;
}

// @AutoBind
const AutoBind = (
    _target: any,
    _methodName: string,
    { value, configurable, enumerable }: PropertyDescriptor
): PropertyDescriptor => ({
  configurable,
  enumerable,
  get() {
    return value.bind(this);
  }
});

// Store
type ListenerFn<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: ListenerFn<T>[] = [];

  addListener(listenerFn: ListenerFn<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private static instance: ProjectState;
  private projects: Project[] = [];

  private constructor() {
    super();
    ProjectState.instance = this;
  }

  static getInstance() {
    return (ProjectState.instance) ? ProjectState.instance : new ProjectState();
  }

  addProject(project: Project) {
    this.projects.push(project);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => (projectId === project.id));

    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Base component
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

// Projects
enum ProjectStatus {
  ACTIVE = 'active',
  FINISHED = 'finished'
}

class Project {
  constructor(public id: string,
              public title: string,
              public description: string,
              private _people: number,
              public status: ProjectStatus) {
  }

  get people(): string {
    return (this._people === 1) ? `${this._people} person` : `${this._people} persons`;
  }
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

// User input
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'afterbegin');

    this.titleInputEl = this.element.querySelector('#title')!;
    this.descriptionInputEl = this.element.querySelector('#description')!;
    this.peopleInputEl = this.element.querySelector('#people')!;

    this.configure();
  }

  renderContent() {
  }

  configure() {
    this.element.id = 'user-input';
    this.element.addEventListener('submit', this.submitHandler);
  }

  private getUserInput(): [string, string, number] | void {
    const title = this.titleInputEl.value;
    const description = this.descriptionInputEl.value;
    const peopleCount = +this.peopleInputEl.value;

    if (validate({
      value: title,
      required: true
    }) && validate({
      value: description,
      minLength: 3,
      maxLength: 30
    }) && validate({
      value: peopleCount,
      min: 1,
      max: 5
    })) {
      return [title, description, peopleCount];
    } else {
      alert('Invalid input!');
    }
  }

  @AutoBind
  private submitHandler(evt: Event) {
    evt.preventDefault();

    const userInputData = this.getUserInput();

    if (Array.isArray(userInputData)) {
      const [title, description, peopleCount] = userInputData;
      projectState.addProject(new Project(
          Math.random().toString(),
          title,
          description,
          peopleCount,
          ProjectStatus.ACTIVE
      ));
      this.element.reset();
    }
  }
}

new ProjectInput();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.FINISHED);