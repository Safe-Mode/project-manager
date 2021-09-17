import { validate } from "../utils/validation/validate.js";
import { AutoBind } from "../utils/decorators/auto-bind.js";
import { Component } from "./base-component.js";
import { projectState } from "../state/project-state.js";
import { Project, ProjectStatus } from "../models/project.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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