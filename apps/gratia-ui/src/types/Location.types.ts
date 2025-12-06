export interface IBaseLocation {
  _id: string;
  code: string;
  name: string;
  isAvailableForShipping: boolean;
}

export interface ICountry extends IBaseLocation {
  states: IState[];
}

export interface IState extends IBaseLocation {
  cities: ICity[];
}

export type ICity = IBaseLocation;
