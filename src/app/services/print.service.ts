import { Injectable } from '@angular/core';
import { AppConfig } from '../models/appconfig.model';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';
import { PatientTreatment } from '../models/patient-treatment.model';
import { PatientVitals } from '../models/patient-vitals.model';
import { PatientAppointment } from '../models/patient-appointment.model';
import { PatientTreatmentDetail } from '../models/patient-treatment-detail.model';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  private openPrintWindow(htmlContent: string, title: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Could not open print window. Please disable your popup blocker.');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Give images and fonts time to load before printing
    setTimeout(() => {
      printWindow.print();
      // Do not automatically close the window so the user can review or manually print/save again
    }, 500);
  }

  printPrescription(patient: Patient, treatment: PatientTreatment, config: AppConfig | null, treatmentDetailId?: number): void {
    const printDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const patientName = patient?.user?.FullName || 'N/A';
    const patientAge = patient?.user?.Age?.toString() || 'N/A';
    const patientGender = patient?.user?.Gender?.toString() || 'N/A';
    const patientPhone = patient?.user?.Contact?.PrimaryPhone || 'N/A';
    const patientAllergies = patient?.Allergies || 'No known allergies';
    const doctorName = 'Clinic Clinician';

    let prescriptionHtml = '';

    if (treatmentDetailId) {
      const detail = treatment.PatientTreatmentDetails?.find(d => d.ID === treatmentDetailId);
      if (detail) {
        prescriptionHtml = `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Treatment Procedure</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px;">
              <div><strong>Date:</strong> ${detail.TreatmentDate || '-'}</div>
              <div><strong>Tooth / Area:</strong> ${detail.Tooth || '-'}</div>
              <div style="grid-column: span 2;"><strong>Procedure:</strong> ${detail.Procedure || '-'}</div>
            </div>
          </div>
          <h3 style="color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Medication & Instructions</h3>
          <ul style="margin: 10px 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            ${detail.Prescription ? detail.Prescription.split('\n').map(line => `<li>${line}</li>`).join('') : '<li>No specific medications prescribed.</li>'}
          </ul>
          ${detail.FollowUpInstructions ? `
            <div style="margin-top: 25px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 14px;">
              <strong>Follow Up Instructions:</strong>
              <p style="margin: 5px 0 0 0; color: #78350f;">${detail.FollowUpInstructions}</p>
            </div>
          ` : ''}
        `;
      }
    } else {
      const activeDetails = treatment.PatientTreatmentDetails?.filter((d: PatientTreatmentDetail) => d.IsActive === 1) || [];
      prescriptionHtml = `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 0;">General Prescription</h3>
          <ul style="margin: 10px 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            ${treatment.Prescription ? treatment.Prescription.split('\n').map(line => `<li>${line}</li>`).join('') : '<li>No general prescription recorded.</li>'}
          </ul>
        </div>
        ${activeDetails.length > 0 ? `
          <h3 style="color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 30px;">Treatment Entries History</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc; text-align: left; font-weight: 600; color: #475569;">
                <th style="padding: 10px; border: 1px solid #e2e8f0; width: 15%;">Date</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; width: 15%;">Tooth</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; width: 35%;">Procedure</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; width: 35%;">Prescription</th>
              </tr>
            </thead>
            <tbody>
              ${activeDetails.map((detail: PatientTreatmentDetail) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0; white-space: nowrap;">${detail.TreatmentDate || '-'}</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${detail.Tooth || '-'}</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${detail.Procedure || '-'}</td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${detail.Prescription || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      `;
    }

    const html = this.getReportTemplate(
      config,
      `
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; background-color: #f8fafc; margin-bottom: 30px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 14px;">
          <div><strong style="color: #475569;">Patient Name:</strong> ${patientName}</div>
          <div><strong style="color: #475569;">Print Date:</strong> ${printDate}</div>
          <div><strong style="color: #475569;">Age / Gender:</strong> ${patientAge} / ${patientGender}</div>
          <div><strong style="color: #475569;">Doctor:</strong> ${doctorName}</div>
          <div><strong style="color: #475569;">Contact No:</strong> ${patientPhone}</div>
          <div><strong style="color: #475569;">Allergies:</strong> <span style="color: #ef4444; font-weight: 500;">${patientAllergies}</span></div>
        </div>
      </div>

      <div style="font-family: Georgia, serif; font-size: 38px; font-weight: bold; color: #0f766e; margin-bottom: 20px; font-style: italic;">Rx</div>

      <div style="min-height: 250px; font-size: 15px; color: #1e293b;">
        ${prescriptionHtml}
      </div>

      ${treatment.ClinicalFindings ? `
        <div style="margin-top: 30px; background: #fafafa; border-left: 3px solid #cbd5e1; padding: 12px 15px; font-size: 14px;">
          <strong>Clinical Findings & Diagnosis:</strong>
          <p style="margin: 5px 0 0 0;">${treatment.ClinicalFindings}</p>
        </div>
      ` : ''}
      `,
      doctorName
    );

    this.openPrintWindow(html, `Prescription_${patientName}`);
  }

  printMedicalHistory(patientUser: User, config: AppConfig | null): void {
    const patient = patientUser.Patients?.[0];
    if (!patient) return;

    const printDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const patientName = patientUser.FullName || 'N/A';
    const patientAge = patientUser.Age?.toString() || 'N/A';
    const patientGender = patientUser.Gender?.toString() || 'N/A';
    const patientPhone = patientUser.Contact?.PrimaryPhone || 'N/A';
    const patientEmail = patientUser.Contact?.PrimaryEmail || 'N/A';
    const patientAllergies = patient.Allergies || 'No known allergies';
    const patientMedications = patient.Medications || 'None';
    const personalHistory = patient.PersonalMedicalHistory || 'None';
    const familyHistory = `Father: ${patient.FatherMedicalHistory || 'None'}, Mother: ${patient.MotherMedicalHistory || 'None'}`;
    const insuranceInfo = patient.InsuranceProvider ? `${patient.InsuranceProvider} (Policy: ${patient.InsurancePolicyNumber || 'N/A'})` : 'N/A';

    const vitals = patient.PatientVitals?.filter((v: PatientVitals) => v.IsActive === 1) || [];
    const appointments = patient.PatientAppointments?.filter((a: PatientAppointment) => a.IsActive === 1) || [];
    const treatment = patient.PatientTreatment;
    const details = treatment?.PatientTreatmentDetails?.filter((d: PatientTreatmentDetail) => d.IsActive === 1) || [];

    const htmlContent = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #0f766e; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Patient Comprehensive Medical History</h2>
        <div style="font-size: 13px; color: #64748b; margin-top: 5px;">Generated on: ${printDate}</div>
      </div>

      <!-- Section 1: Profile -->
      <h3 style="color: #0f766e; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px;">1. Patient Profile</h3>
      <table style="width: 100%; font-size: 14px; margin-bottom: 20px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; width: 20%; font-weight: 600; color: #475569;">Patient ID:</td>
          <td style="padding: 6px 0; width: 30%;">${patient.ID}</td>
          <td style="padding: 6px 0; width: 20%; font-weight: 600; color: #475569;">Contact Phone:</td>
          <td style="padding: 6px 0; width: 30%;">${patientPhone}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #475569;">Full Name:</td>
          <td>${patientName}</td>
          <td style="padding: 6px 0; font-weight: 600; color: #475569;">Email:</td>
          <td>${patientEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #475569;">Age / Gender:</td>
          <td>${patientAge} / ${patientGender}</td>
          <td style="padding: 6px 0; font-weight: 600; color: #475569;">Insurance:</td>
          <td>${insuranceInfo}</td>
        </tr>
      </table>

      <!-- Section 2: Medical Background -->
      <h3 style="color: #0f766e; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px;">2. Medical Background & Allergies</h3>
      <div style="display: grid; grid-template-columns: 1fr; gap: 10px; font-size: 14px; margin-bottom: 20px;">
        <div><strong>Drug/Food Allergies:</strong> <span style="color: #ef4444; font-weight: 500;">${patientAllergies}</span></div>
        <div><strong>Current Medications:</strong> ${patientMedications}</div>
        <div><strong>Personal Medical History:</strong> ${personalHistory}</div>
        <div><strong>Family Medical History:</strong> ${familyHistory}</div>
      </div>

      <!-- Section 3: Vitals -->
      <h3 style="color: #0f766e; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px;">3. Recorded Patient Vitals Log</h3>
      ${vitals.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc; text-align: left; font-weight: 600; color: #475569;">
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Date</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">BP (mmHg)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Pulse (bpm)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Temp (F)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Weight (kg)</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            ${vitals.map((v: PatientVitals) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; white-space: nowrap;">${v.CreatedDate ? new Date(v.CreatedDate).toLocaleDateString() : '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${v.BloodPressureSystolic && v.BloodPressureDiastolic ? `${v.BloodPressureSystolic}/${v.BloodPressureDiastolic}` : '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${v.HeartRate || '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${v.Temperature || '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${v.Weight || '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${v.Height || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="font-size: 14px; color: #64748b; font-style: italic;">No vitals recorded.</p>'}

      <!-- Section 4: Treatment History -->
      <h3 style="color: #0f766e; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px;">4. Treatment and Procedures History</h3>
      ${treatment ? `
        <div style="font-size: 14px; margin-bottom: 15px; display: grid; grid-template-columns: 1fr; gap: 8px;">
          <div><strong>Chief Complaint:</strong> ${treatment.ChiefComplaint || '-'}</div>
          <div><strong>Diagnosis:</strong> ${treatment.Diagnosis || '-'}</div>
          <div><strong>Treatment Plan:</strong> ${treatment.TreatmentPlan || '-'}</div>
          <div><strong>Clinical Findings:</strong> ${treatment.ClinicalFindings || '-'}</div>
          <div><strong>General Prescriptions:</strong> ${treatment.Prescription || 'None'}</div>
        </div>
        ${details.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc; text-align: left; font-weight: 600; color: #475569;">
                <th style="padding: 8px; border: 1px solid #e2e8f0; width: 15%;">Date</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; width: 15%;">Tooth</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; width: 35%;">Procedure Performed</th>
                <th style="padding: 8px; border: 1px solid #e2e8f0; width: 35%;">Detail Prescription</th>
              </tr>
            </thead>
            <tbody>
              ${details.map((d: PatientTreatmentDetail) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px; border: 1px solid #e2e8f0; white-space: nowrap;">${d.TreatmentDate || '-'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${d.Tooth || '-'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${d.Procedure || '-'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${d.Prescription || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      ` : '<p style="font-size: 14px; color: #64748b; font-style: italic;">No active treatment records found.</p>'}

      <!-- Section 5: Appointments -->
      <h3 style="color: #0f766e; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px;">5. Appointment Attendance Log</h3>
      ${appointments.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc; text-align: left; font-weight: 600; color: #475569;">
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Date & Time</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Doctor Name</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Treatment Type</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.map((a: PatientAppointment) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #e2e8f0; white-space: nowrap;">${a.StartDateTime ? new Date(a.StartDateTime as any).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.DoctorName || '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.TreatmentName || '-'}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${a.AppointmentStatus || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="font-size: 14px; color: #64748b; font-style: italic;">No appointment history found.</p>'}
    `;

    const html = this.getReportTemplate(config, htmlContent, 'Clinic Records Department');
    this.openPrintWindow(html, `Medical_History_${patientName}`);
  }

  printReferralLetter(patientUser: User, config: AppConfig | null, referredToDoctor: string, referredToClinic: string, letterText: string): void {
    const printDate = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const patientName = patientUser.FullName || 'N/A';
    const clinicName = config?.ClinicName || 'Clinic Manager';

    const htmlContent = `
      <div style="font-size: 15px; color: #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 30px;">
          <strong>Date:</strong> ${printDate}
        </div>

        <div style="margin-bottom: 30px;">
          <strong>To,</strong><br>
          <strong style="color: #0f766e;">Dr. ${referredToDoctor}</strong><br>
          <span>Department of Dental / Medical Specialties</span><br>
          <strong>${referredToClinic}</strong>
        </div>

        <div style="margin-bottom: 25px; padding: 10px 15px; background: #f8fafc; border-left: 4px solid #0f766e; border-radius: 4px; font-weight: 600;">
          Subject: Clinical Referral for Patient: ${patientName}
        </div>

        <div style="white-space: pre-wrap; font-size: 15px; color: #1e293b; margin-top: 20px;">${letterText}</div>

        <div style="margin-top: 60px;">
          <p style="margin-bottom: 40px;">Warm regards,</p>
          <div style="width: 250px; border-top: 1px solid #cbd5e1; padding-top: 5px;">
            <strong>Referring Clinician</strong><br>
            <span style="color: #64748b; font-size: 13px;">${clinicName}</span>
          </div>
        </div>
      </div>
    `;

    const html = this.getReportTemplate(config, htmlContent, clinicName);
    this.openPrintWindow(html, `Referral_Letter_${patientName}`);
  }

  private getReportTemplate(config: AppConfig | null, content: string, signOffName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document Print</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            box-sizing: border-box;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 15px;
            margin-bottom: 25px;
            border-collapse: collapse;
          }
          .clinic-title {
            font-size: 24px;
            font-weight: bold;
            color: #0f766e;
            margin: 0;
          }
          .clinic-subtitle {
            font-size: 14px;
            color: #475569;
            margin: 2px 0;
          }
          .clinic-address {
            font-size: 12px;
            color: #64748b;
            margin: 2px 0;
          }
          @media print {
            body {
              background-color: #ffffff;
              color: #000000;
            }
            .print-container {
              padding: 0;
              width: 100%;
            }
            @page {
              margin: 15mm 20mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <table class="header-table">
            <tr>
              <td style="vertical-align: middle;">
                ${config?.ClinicLogo ? `<img src="${config.ClinicLogo}" alt="Logo" style="max-height: 70px; max-width: 180px; object-fit: contain; border-radius: 4px;">` : ''}
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <h1 class="clinic-title">${config?.ClinicName || 'Clinic Manager'}</h1>
                <div class="clinic-subtitle">${config?.ClinicProp || ''}</div>
                <div class="clinic-address">${config?.ClinicAddress || ''}</div>
              </td>
            </tr>
          </table>

          <div class="report-content">
            ${content}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
