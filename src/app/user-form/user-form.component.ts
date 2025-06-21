import { Component } from '@angular/core';
import { GptService } from '../services/gpt.service';
import { EmailService } from '../services/email.service';
import { TranslateService } from '@ngx-translate/core';

enum UnitType { Thomn = 0, Page = 1 }

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})

export class UserFormComponent {
  constructor(private gptService: GptService, private emailService: EmailService, private translate: TranslateService) { }

  unitTypeOptions = [
    { label: 'THOMN_LABEL', value: UnitType.Thomn },
    { label: 'PAGE_LABEL', value: UnitType.Page }
  ];

  formData = {
    'memorizationUnit': UnitType.Thomn,
    'startUnit': 'H18T5',
    'endUnit': 'H31T3',
    'memorizationDaysPerCycle': 2,
    'revisionDaysPerCycle': 2,
    'restDaysPerCycle': 1,
    'startDate': '2025-06-09',
  };
  formEmail = {
    'email': 'toEmail@gmail.com',
  }


  steps = ['MEMORIZATION_UNIT', 'START_UNIT', 'END_UNIT', 'MEMORIZATION_DAYS_PER_CYCLE', 'REVISION_DAYS_PER_CYCLE', 'REST_DAYS_PER_CYCLE', 'START_DATE', 'PREVIEW_PLAN', 'FULL_PLAN', 'DOWNLOAD'];

  csvHeaders: string[] = [];
  previewPlanRows: string[][] = [];
  fullPlanCSV: string = ''

  estimatedCompletionDate: string = '';
  isPreviewPlanReady: boolean = false
  isFullPlanReady: boolean = false
  isDownloading: boolean = false

  inputJson = {};
  formattedUserInput = {};

  currentStepNumber = 1
  currentStep = this.steps[this.currentStepNumber - 1];

  getProgress(): number {
    return Math.round(this.currentStepNumber / this.steps.length * 100);
  }

  goToNextStep() {
    this.currentStepNumber += 1;
    if (this.currentStepNumber > this.steps.length) {
      this.currentStepNumber = this.steps.length;
    }
    this.currentStep = this.steps[this.currentStepNumber - 1];
  }

  goToPreviousStep() {
    this.currentStepNumber -= 1;
    if (this.currentStepNumber == 0) {
      this.currentStepNumber = 1;
    }
    this.currentStep = this.steps[this.currentStepNumber - 1];
  }

  getFormattedSummary() {
    return `
    Memorization Unit: ${UnitType[this.formData.memorizationUnit]}
    Start from: ${this.formData.startUnit}
    End at: ${this.formData.endUnit}
    Memorization days per cycle: ${this.formData.memorizationDaysPerCycle}
    Revision days per cycle: ${this.formData.revisionDaysPerCycle}
    Rest days per cycle: ${this.formData.restDaysPerCycle}
    Start Date: ${this.formData.startDate}
  `.trim();
  }

  getFormattedInputJson() {
    return {
      'memorizationUnit': UnitType[this.formData.memorizationUnit],
      'startUnit': this.formData.startUnit,
      'endUnit': this.formData.endUnit,
      'memorizationDaysPerCycle': this.formData.memorizationDaysPerCycle,
      'revisionDaysPerCycle': this.formData.revisionDaysPerCycle,
      'restDaysPerCycle': this.formData.restDaysPerCycle,
      'startDate': this.formData.startDate
    };
  }

  getTranslatedTask(task: string, header: string): string {
    if (header !== "CSV_HEADERS.TASK") {
      return task;
    }
    const normalized = task.toUpperCase().replace(/\s*\+\s*/g, '_PLUS_');
    return `TASK_LABELS.${normalized}`;
  }



  private parsePlanCSV(csvText: string): void {
    const rows: string[] = csvText.trim().split('\n');
    const rawHeaders = rows.shift()!.split(',').map(h => h.trim().toUpperCase());

    this.csvHeaders = rawHeaders.map(h => `CSV_HEADERS.${h}`);

    this.previewPlanRows = rows.map((row: string) =>
      row.split(',').map((cell: string) => cell.trim())
    );
  }


  generatePreviewPlan(): void {
    this.isPreviewPlanReady = false;
    this.goToNextStep();
    this.formattedUserInput = this.getFormattedInputJson();

    this.gptService.generatePreviewPlan(this.formattedUserInput).subscribe({
      next: (response: any) => {
        this.estimatedCompletionDate = response.estimatedCompletionDate;
        this.parsePlanCSV(response.previewCSV);
        this.isPreviewPlanReady = true;
      },
      error: (err: any) => {
        console.error('Error getting preview:', err);
      }
    });
  }

  generateFullPlan() {
    this.isFullPlanReady = false;
    this.goToNextStep();
    this.gptService.generateFullPlan(this.formattedUserInput).subscribe({

      next: (response: any) => {
        this.fullPlanCSV = response.planCSV;
        this.isFullPlanReady = true;
      },
      error: (err: any) => {
        this.isFullPlanReady = true;
        console.error('Error getting full plan:', err);
      }
    });
  }

  downloadFullPlan(): void {
    this.isDownloading = true;

    const blob = new Blob([this.fullPlanCSV], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'full-plan.csv';
    anchor.click();

    window.URL.revokeObjectURL(url);
    this.isDownloading = false;
  }

  SubscribeToEmailReminder(): void {
    this.emailService.subscribeToEmailReminder(this.formEmail.email, this.fullPlanCSV).subscribe({
      next: (response: any) => {
        window.alert(response.message)
      }
    });
  }

  UnsubscribeFromEmailReminder(): void {
    this.emailService.unsubscribeFromEmailReminder(this.formEmail.email).subscribe({
      next: (response: any) => {
        window.alert(response.message)
      }
    });
  }
}
