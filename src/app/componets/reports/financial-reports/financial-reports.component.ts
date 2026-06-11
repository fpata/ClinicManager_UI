import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-reports.component.html',
  styleUrl: './financial-reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancialReportsComponent implements OnInit {
  revenueStart = '';
  revenueEnd = '';
  isRevenueLoading = false;
  isOutstandingLoading = false;

  constructor(
    private reportService: ReportService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.revenueStart = this.formatDate(firstDay);
    this.revenueEnd = this.formatDate(now);
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  downloadRevenue(): void {
    this.isRevenueLoading = true;
    this.cdr.markForCheck();

    this.reportService.downloadRevenueReport(this.revenueStart, this.revenueEnd).subscribe({
      next: (blob) => {
        this.saveBlob(blob, `revenue_report_${this.revenueStart}_to_${this.revenueEnd}.csv`);
        this.messageService.success('Revenue report downloaded successfully.');
        this.isRevenueLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Revenue report error:', err);
        this.messageService.error('Failed to generate revenue report.');
        this.isRevenueLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearRevenueFilters(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.revenueStart = this.formatDate(firstDay);
    this.revenueEnd = this.formatDate(now);
    this.cdr.markForCheck();
  }

  downloadOutstandingBalances(): void {
    this.isOutstandingLoading = true;
    this.cdr.markForCheck();

    this.reportService.downloadOutstandingBalancesReport().subscribe({
      next: (blob) => {
        this.saveBlob(blob, `outstanding_balances_${this.formatDate(new Date())}.csv`);
        this.messageService.success('Outstanding balances report downloaded successfully.');
        this.isOutstandingLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Outstanding balances error:', err);
        this.messageService.error('Failed to generate outstanding balances report.');
        this.isOutstandingLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private saveBlob(blob: Blob, defaultFilename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
