export interface IBusinessRule {
  isValid(): boolean;

  readonly errorMessage: string;
}
