export const AutoBind = (
    _target: any,
    _methodName: string,
    { value, configurable, enumerable }: PropertyDescriptor
): PropertyDescriptor => ({
  configurable,
  enumerable,
  get() {
    return value.bind(this);
  }
});