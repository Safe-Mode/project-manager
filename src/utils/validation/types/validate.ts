import { ValidationConfig } from "../validation-config";

export const validate = ({ value, required, minLength, maxLength, min, max }: ValidationConfig): boolean => {
  let isValid = true;

  if (required) {
    isValid = isValid && !!value;
  }

  const isStringValue = typeof value === 'string';
  const isNumeric = typeof value === 'number' && !isNaN(value);

  if (isStringValue) {
    const stringLength = value?.toString().trim().length;

    if (minLength != null) {
      isValid = isValid && (stringLength >= minLength);
    }

    if (maxLength) {
      isValid = isValid && (stringLength <= maxLength);
    }
  }

  if (isNumeric) {
    if (min != null) {
      isValid = isValid && (value >= min);
    }

    if (max) {
      isValid = isValid && (value <= max);
    }
  }

  return isValid;
};
