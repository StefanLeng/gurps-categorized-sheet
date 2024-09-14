export function i18n(value : string, fallback?: string | undefined) {
    let result = game.i18n.localize(value)
    if (!!fallback) return value === result ? fallback : result
    return result
  }
  