// TODO: Make this component an Angular library

import { Component, ElementRef, forwardRef, Input, ViewChild } from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import intlTelInput from "intl-tel-input";

import { PlatformService } from "@/services/platform/platform.service";

/** The datatype of the value stored by the input component. */
export type PhoneNumber = { value: string; valid: boolean };

/** To use as the default value of a form control bound to by this component. */
export const DEFAULT_PHONE_NUMBER_VALUE = { value: "", valid: false };

export const PHONE_NUMBER_VALIDATOR = (control: FormControl) =>
  control.value.valid ? null : { formatError: { value: control.value.value } };

const TEL_INPUT_OPTIONS = {
  utilsScript: "node_modules/intl_tel_input/src/js/utils.js",
  separateDialCode: true,
};

@Component({
  selector: "app-input-tel",
  templateUrl: "./input-tel.component.html",
  styleUrls: ["./input-tel.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTelComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class InputTelComponent {
  @ViewChild("phoneInput") phoneInput!: ElementRef;
  @Input() required: boolean = false;
  @Input() options?: intlTelInput.Options;
  private _intlTelInput: any;
  value!: string;
  valid: boolean = false;
  onChange: (value: PhoneNumber) => void = () => {};
  onTouched = () => {};

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit() {
    if (this.platformService.isServer) return;

    // Removes English names from the country dropdown
    window.intlTelInputGlobals
      .getCountryData()
      .forEach((country: intlTelInput.CountryData) => (country.name = country.name.replace(/.+\((.+)\)/, "$1")));

    this._intlTelInput = intlTelInput(this.phoneInput.nativeElement, {
      ...TEL_INPUT_OPTIONS,
      ...this.options,
    });
  }

  registerOnChange(fn: (value: PhoneNumber) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(input: PhoneNumber) {
    this.value = input.value;
  }

  validatePhoneNumber() {
    this._intlTelInput.setNumber(this.value);
    this.valid = !!this._intlTelInput.isValidNumber();
    this.onChange({ value: this._intlTelInput.getNumber(), valid: this.valid });
  }
}
