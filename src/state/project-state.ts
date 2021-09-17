import { State } from "./state.js";
import { Project, ProjectStatus } from "../models/project.js";

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();