export interface SpecValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  specVersion: string;
  checks: SpecCheck[];
}

export interface SpecCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SpecValidationOptions {
  strict?: boolean;
}
