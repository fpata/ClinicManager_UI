import { BaseEntity } from './base.model';

export interface SystemKey extends BaseEntity {
  KeyName: string;
  KeyValue: string;
}
