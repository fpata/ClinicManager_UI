import { BaseEntity } from "./base.model";

export class Contact extends BaseEntity {
  
  PrimaryPhone?: string;
  SecondaryPhone?: string;
  PrimaryEmail?: string;
  SecondaryEmail?: string;
  RelativeName?: string;
  RelativeRealtion?: string;
  RelativePhone?: string;
  RelativeEmail?: string;
  UserID?: number;

  //user?: any; // Avoid circular reference
}
