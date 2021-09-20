export enum ProjectStatus {
  ACTIVE = 'active',
  FINISHED = 'finished'
}

export class Project {
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
