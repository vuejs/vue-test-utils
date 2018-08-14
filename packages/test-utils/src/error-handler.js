// @flow

export default function errorHandler (
  errorOrString: any,
  vm: Component
): void {
  const error =
    typeof errorOrString === 'object'
      ? errorOrString
      : new Error(errorOrString)

  vm._error = error

  throw error
}
