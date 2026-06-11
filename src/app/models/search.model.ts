import { UtilityService } from "../services/utility.service";

export class SearchModel {

  constructor(private util: UtilityService) {
      // Make util non-enumerable so it won't appear in JSON
    Object.defineProperty(this, 'util', { enumerable: false });
    this.StartDate = this.util.formatDate(new Date((Date.now() - 365 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd');
    this.EndDate = this.util.formatDate(new Date((Date.now() + 180 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd');
  }

  UserID?: number = 0;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  // Change to number (nullable) to match backend enum underlying type
  UserType?: number | null;
  PrimaryPhone?: string;
  PrimaryEmail?: string;
  PermCity?: string;
  EndDate?: string;
  StartDate?: string;
 pageNumber?: number = 1;
 pageSize?: number = 10;
   PatientID?: number = 0;
  DoctorID?: number = 0;
  DoctorName?: string;
LastTreatmentName?: string;
LastTreatmentDate?: string;
}



export class SearchResultModel {
  TotalCount: number = 0;
  HasMoreRecords: boolean = false;
  Message: string = '';
  Results: any[] = [];
}



