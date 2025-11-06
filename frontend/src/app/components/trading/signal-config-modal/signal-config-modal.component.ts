import { Component, Output, EventEmitter, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

interface SignalConfig {
  quantity: number;
  leverage: number;
  minPriceSpreadPercent: number;
  primaryExchange: string;
  hedgeExchange: string;
  strategy: string;
  minFundingSpreadPercent?: number;
  primarySide?: 'long' | 'short';
  hedgeSide?: 'long' | 'short';
}

@Component({
  selector: 'app-signal-config-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signal-config-modal.component.html',
  styleUrls: ['./signal-config-modal.component.scss']
})
export class SignalConfigModalComponent implements OnInit {
  // New input signals approach
  open = input<boolean>(false);
  strategy = input<string>('combined');
  symbol = input<string>('');
  primaryExchange = input<string>('');
  hedgeExchange = input<string>('');
  signalId = input<string | null>(null);
  initialConfig = input<SignalConfig | null>(null);

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<SignalConfig>();

  signalForm!: FormGroup;

  ngOnInit(): void {
    this.signalForm = new FormGroup({
      quantity: new FormControl(100, [Validators.required, Validators.min(0.01)]),
      leverage: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(125)]),
      minPriceSpreadPercent: new FormControl(0.5, [Validators.required, Validators.min(0)]),
      minFundingSpreadPercent: new FormControl(0.1, [Validators.min(0)]),
      primarySide: new FormControl('long', [Validators.required]),
      hedgeSide: new FormControl('short', [Validators.required]),
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.signalForm.valid) {
      const config: SignalConfig = {
        ...this.signalForm.value,
        primaryExchange: this.primaryExchange(),
        hedgeExchange: this.hedgeExchange(),
        strategy: this.strategy(),
      };
      this.save.emit(config);
    }
  }
}
