import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface LayeredInput {
  base: boolean;
  extra: boolean;
}

@Component({
  selector: 'app-input-layered',
  templateUrl: './input-layered.component.html',
  styleUrls: ['./input-layered.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputLayeredComponent),
      multi: true,
    },
  ],
})
export class InputLayeredComponent implements ControlValueAccessor {
  @Input({ required: true }) formControlName!: string;
  @Input({ required: true }) outerLabel!: string;
  @Input({ required: true }) innerLabel!: string;

  onChange!: () => void;
  onTouched!: () => void;

  outerValue: boolean = false;
  innerValue: boolean = false;

  registerOnChange(fn: (value: LayeredInput) => void): void {
    this.onChange = () => {
      fn({ base: this.outerValue, extra: this.innerValue });
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: LayeredInput): void {
    this.outerValue = value.base;
    this.innerValue = value.extra;
  }
}
