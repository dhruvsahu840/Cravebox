export const PIZZA_SIZES = ['Personal', 'Medium', 'Large'] as const
export type PizzaSize = (typeof PIZZA_SIZES)[number]

export interface CustomizationOption {
  label: string
  price: number
}

export interface CustomizationGroup {
  name: string
  options: CustomizationOption[]
}

/** Size options use absolute prices; other groups are add-ons to the base/size price. */
export function isSizeGroup(name: string) {
  return name.trim().toLowerCase() === 'size'
}

export function getSizeGroup(customizations?: CustomizationGroup[] | null) {
  return customizations?.find(g => isSizeGroup(g.name))
}

export function hasSizeOptions(customizations?: CustomizationGroup[] | null) {
  return Boolean(getSizeGroup(customizations)?.options?.length)
}

export function minProductPrice(product: {
  price: number
  discountedPrice?: number
  customizations?: CustomizationGroup[]
}) {
  const sizeGroup = getSizeGroup(product.customizations)
  if (sizeGroup?.options?.length) {
    return Math.min(...sizeGroup.options.map(o => o.price))
  }
  return product.discountedPrice || product.price
}

export function buildSizeCustomizations(
  personal: number,
  medium: number,
  large: number
): CustomizationGroup[] {
  return [{
    name: 'Size',
    options: [
      { label: 'Personal', price: personal },
      { label: 'Medium', price: medium },
      { label: 'Large', price: large },
    ],
  }]
}

/** Parse "Size: Medium, Extra Cheese: Yes" into group → label map. */
export function parseCustomizationKey(key?: string | null): Record<string, string> {
  if (!key?.trim()) return {}
  const result: Record<string, string> = {}
  for (const part of key.split(',').map(p => p.trim()).filter(Boolean)) {
    const idx = part.indexOf(':')
    if (idx === -1) continue
    const group = part.slice(0, idx).trim()
    const label = part.slice(idx + 1).trim()
    if (group && label) result[group] = label
  }
  return result
}

/**
 * Server-safe unit price from product + cart customization string.
 * Size option prices are absolute; other option prices are add-ons.
 */
export function resolveUnitPrice(
  product: {
    price: number
    discountedPrice?: number
    customizations?: CustomizationGroup[]
  },
  customizationsKey?: string | null
) {
  const sizeGroup = getSizeGroup(product.customizations)
  const selected = parseCustomizationKey(customizationsKey)
  const sizeLabel = Object.entries(selected).find(([name]) => isSizeGroup(name))?.[1]

  let unit = product.discountedPrice || product.price

  if (sizeGroup && sizeLabel) {
    const opt = sizeGroup.options.find(o => o.label === sizeLabel)
    if (opt) unit = opt.price
  }

  for (const group of product.customizations || []) {
    if (isSizeGroup(group.name)) continue
    const label = selected[group.name]
    if (!label) continue
    const opt = group.options.find(o => o.label === label)
    if (opt) unit += opt.price
  }

  return unit
}

export function calcUnitPriceFromSelections(
  product: {
    price: number
    discountedPrice?: number
    customizations?: CustomizationGroup[]
  },
  selections: Record<string, CustomizationOption>
) {
  const key = Object.entries(selections)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}: ${v.label}`)
    .join(', ')
  return resolveUnitPrice(product, key || undefined)
}
