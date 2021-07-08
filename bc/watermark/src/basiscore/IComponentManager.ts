import ISource from "./ISource";

export default interface IComponentManager {
  initializeAsync(): Promise<void>;
  runAsync(source?: ISource): Promise<boolean>;
}
