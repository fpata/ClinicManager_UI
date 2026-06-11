export class BaseEntity {
  ID: number;
  CreatedDate: string;        // ISO (UTC) from backend
  ModifiedDate: string;       // ISO (UTC)
  CreatedBy: number;
  ModifiedBy: number;
  IsActive: number;           // 1 / 0 byte
  ModificationReason?: string;
  CreatedByIP?: string;
  ModifiedByIP?: string;
}

