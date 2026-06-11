import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PatientSearchComponent } from '../patient-search/patient-search.component';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-master',
  standalone: true,
  templateUrl: './patient-master.component.html',
  styleUrls: ['./patient-master.component.css'],
  imports: [PatientSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientMasterComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.user$.subscribe({
        next: (newUser) => {
          this.user = newUser;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error subscribing to user changes:', error?.message || error?.toString());
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onSave(): void {
    console.log('Save clicked');
    // TODO: Implement save logic
  }

  onClear(): void {
    console.log('Clear clicked');
    // TODO: Implement clear logic, e.g., reset form
  }

  onDelete(): void {
    console.log('Delete clicked');
    // TODO: Implement delete logic with confirmation
  }
}

