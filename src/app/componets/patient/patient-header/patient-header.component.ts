import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patient-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-header.component.html',
  styleUrls: ['./patient-header.component.css']
})
export class PatientHeaderComponent {
  @Input() user:User

  get displayName(): string {
    if (this.user) {
      const first = this.user.FirstName || '';
      const last = this.user.LastName || '';
      const name = (first + ' ' + last).trim();
      return name.length ? name : 'Unknown Patient';
    }
    return 'No Patient Selected';
  }
}
