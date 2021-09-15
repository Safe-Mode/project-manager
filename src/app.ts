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
      this.element.reset();
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
      console.log(userInputData)
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