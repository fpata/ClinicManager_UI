import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AppDatePipe } from '../../../common/app-date.pipe';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BillingRecord } from '../../../models/billing.model';
import { Payment, PaymentMethod } from '../../../models/payment.model';
import { BillingService } from '../../../services/blling.service';
import { PaymentService } from '../../../services/payment.service';
import { MessageService } from '../../../services/message.service';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-payment',
  imports: [FormsModule, CommonModule, CurrencyPipe, AppDatePipe],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentComponent implements OnInit, OnDestroy {
  billingRecord: BillingRecord | null = null;
  paymentList: Payment[] = [];
  newPayment: any = {};
  paymentMethods = Object.values(PaymentMethod);
  formSubmitted = false;

  private subscription: Subscription | null = null;

  constructor(
    private billingService: BillingService,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.subscription = this.dataService.billingRecord$.subscribe({
      next: (record: BillingRecord | null) => {
        if (record && record.ID) {
          this.loadBillingRecordDetails(record.ID);
        } else {
          this.billingRecord = null;
          this.paymentList = [];
          this.newPayment = {};
          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        console.error('Error subscribing to selected billing record:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadBillingRecordDetails(id: number): void {
    this.billingService.getBilling(id).subscribe({
      next: (record: BillingRecord) => {
        this.billingRecord = record;
        this.paymentList = record.Payments || [];
        this.newPayment = {
          PaymentID: 0,
          BillingID: record.ID || 0,
          Amount: record.BalanceDue || 0,
          PaymentMethod: PaymentMethod.Cash,
          TransactionDate: new Date().toISOString().substring(0, 10),
          Reference: '',
          Notes: ''
        };
        this.formSubmitted = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.messageService.error('Error fetching billing details: ' + (err.message || err.statusText || err));
      }
    });
  }

  SavePayment(form: any): void {
    this.formSubmitted = true;
    if (!form.valid) {
      this.messageService.warn('Please fill out all required fields correctly');
      return;
    }

    if (this.newPayment.Amount <= 0) {
      this.messageService.warn('Payment amount must be greater than 0');
      return;
    }

    if (this.billingRecord && this.newPayment.Amount > this.billingRecord.BalanceDue!) {
      const confirmMsg = `The payment amount (${this.newPayment.Amount}) exceeds the balance due (${this.billingRecord.BalanceDue}). Are you sure you want to record this payment?`;
      const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
      confirmFn(confirmMsg).then((confirmed: boolean) => {
        if (confirmed) {
          this.postPayment(form);
        }
      });
    } else {
      this.postPayment(form);
    }
  }

  private postPayment(form: any): void {
    const paymentToPost: Payment = {
      ...this.newPayment,
      TransactionDate: new Date(this.newPayment.TransactionDate).toISOString()
    };

    this.paymentService.createPayment(paymentToPost).subscribe({
      next: (savedPayment: Payment) => {
        this.messageService.success('Payment recorded successfully');
        this.formSubmitted = false;
        if (this.billingRecord?.ID) {
          this.loadBillingRecordDetails(this.billingRecord.ID);
        }
        this.resetPaymentForm(form);
      },
      error: (err: any) => {
        this.messageService.error('Error recording payment: ' + (err.message || err.statusText || err));
      }
    });
  }

  resetPaymentForm(form?: any): void {
    this.newPayment = {
      PaymentID: 0,
      BillingID: this.billingRecord?.ID || 0,
      Amount: this.billingRecord?.BalanceDue || 0,
      PaymentMethod: PaymentMethod.Cash,
      TransactionDate: new Date().toISOString().substring(0, 10),
      Reference: '',
      Notes: ''
    };
    this.formSubmitted = false;
    if (form) {
      form.resetForm({
        Amount: this.billingRecord?.BalanceDue || 0,
        PaymentMethod: PaymentMethod.Cash,
        TransactionDate: new Date().toISOString().substring(0, 10),
        Reference: '',
        Notes: ''
      });
    }
    this.cdr.markForCheck();
  }

  ClearSelectedRecord(): void {
    this.billingService.setSelectedBillingRecord(null);
    this.dataService.setBillingRecord(null);
  }
}
