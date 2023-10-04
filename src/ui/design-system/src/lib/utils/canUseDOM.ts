// Taken from: https://remix.run/docs/en/v1/guides/constraints#uselayouteffect
export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
)
