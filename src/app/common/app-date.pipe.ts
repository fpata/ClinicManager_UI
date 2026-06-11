import { Pipe, PipeTransform } from '@angular/core';
import { DataService } from '../services/data.service';
import { UtilityService } from '../services/utility.service';

@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false
})
export class AppDatePipe implements PipeTransform {
  constructor(private dataService: DataService, private utilityService: UtilityService) {}

  transform(value: any, formatType?: string): string {
    if (!value) return '';

    const config = this.dataService.getConfig();
    let dateFormat = config?.DateFormat;

    if (!dateFormat) {
      dateFormat = 'MM/dd/yyyy';
    }

    if (formatType === 'short') {
      return this.utilityService.formatDate(value, `${dateFormat} HH:mm`);
    } else if (formatType === 'fullDate') {
      return this.utilityService.formatDate(value, dateFormat);
    } else if (formatType === 'mediumDate') {
      return this.utilityService.formatDate(value, dateFormat);
    } else {
      return this.utilityService.formatDate(value, dateFormat);
    }
  }
}
