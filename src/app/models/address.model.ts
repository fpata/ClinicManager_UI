import { BaseEntity } from "./base.model";

export class Address extends BaseEntity {
  PermAddress1?: string;
  PermAddress2?: string;
  PermState?: string;
  PermCity?: string;
  PermCountry?: string;
  PermZipCode?: string;
  CorrAddress1?: string;
  CorrAddress2?: string;
  CorrCity?: string;
  CorrState?: string;
  CorrCountry?: string;
  CorrZipCode?: string;
  AddressType?: string;
  UserID?: number;
  //user?: any; // Avoid circular reference
}
