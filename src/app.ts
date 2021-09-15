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

// Store
type ListenerFn = (items: Project[]) => void;

class Store {
  private static instance: Store;
  private listeners: ListenerFn[] = [];
  private projects: Project[] = [];

  private constructor() {
    Store.instance = this;
  }

  static getInstance() {
    return (Store.instance) ? Store.instance : new Store();
  }

  addListener(listenerFn: ListenerFn) {
    this.listeners.push(listenerFn);
  }

  addProject(project: Project) {
    this.projects.push(project);

    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const store = Store.getInstance();

// Projects
enum ProjectStatus {
  ACTIVE = 'active',
  FINISHED = 'finished'
}

class Project {
  constructor(public id: string,
              public title: string,
              public description: string,
              public people: number,
              public status: ProjectStatus) {
  }
}

class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLElement;
  projectsListEl: HTMLUListElement;

  projects: Project[] = [];

  constructor(private type: ProjectStatus) {
    this.templateEl = document.querySelector('#project-list')!;
    this.hostEl = document.querySelector('#app')!;
    this.element = document.importNode(this.templateEl.content, true).firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.projectsListEl = this.element.querySelector('ul')!;

    store.addListener((projects: Project[]) => {
      this.projects = projects.filter((project) => (project.status === this.type));
      this.renderProjects();
    });

    this.renderContent();
    this.attach();
  }

  private renderProjects() {
    let html = '';

    for (const project of this.projects) {
      const listItemEl = document.createElement('li');
      listItemEl.textContent = project.title;
      html += listItemEl.outerHTML;
    }

    this.projectsListEl.innerHTML = html;
  }

  private renderContent() {
    this.projectsListEl.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type} projects`.toUpperCase();
  }

  private attach() {
    this.hostEl.insertAdjacentElement('beforeend', this.element);
  }
}

// User input
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

class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.querySelector('#project-input')!;
    this.hostEl = document.querySelector('#app')!;
    this.element = document.importNode(this.templateEl.content, true).firstElementChild as HTMLFormElement;
    this.titleInputEl = this.element.querySelector('#title')!;
    this.descriptionInputEl = this.element.querySelector('#description')!;
    this.peopleInputEl = this.element.querySelector('#people')!;

    this.configure();
    this.attach();
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
      store.addProject(new Project(
          Math.random().toString(),
          title,
          description,
          peopleCount,
          ProjectStatus.ACTIVE
      ));
      this.element.reset();
    }
  }

  private configure() {
    this.element.id = 'user-input';
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostEl.insertAdjacentElement('afterbegin', this.element);
  }
}

new ProjectInput();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.FINISHED);