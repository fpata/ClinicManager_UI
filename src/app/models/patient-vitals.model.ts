import { DataService } from "../services/data.service";
import { UtilityService } from "../services/utility.service";
import { BaseEntity } from "./base.model";

  export class PatientVitals extends BaseEntity {

    constructor() { 
      super();
    }
    
    UserID: number=0;
    PatientID: number =0;
    RecordedDate: String;
    BloodPressureSystolic?: number;
    BloodPressureDiastolic?: number;
    HeartRate?: number;
    Temperature?: string; // in Celsius
    Weight?: string; // in kg
    Height?: string; // in cm
    OxygenSaturation?: number;
    RespiratoryRate?: number;
    Notes?: string;
    RecordedBy?: number;
    BloodType?: string;
    SugarFasting?: number;
    SugarPostPrandial?: number;
    SugarRandom?: number;
  }