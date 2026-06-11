export class Message {
  id: number;
  type: MessageType;
  message: string;
  autoClose: boolean;
  keepAfterRouteChange: boolean;
  fade: boolean;
  autoCloseTimeout?: number;

  constructor(init?:Partial<Message>) {
      Object.assign(this, init);
  }
}

export enum MessageType {
  Success,
  Error,
  Info,
  Warning
}
