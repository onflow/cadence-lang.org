// TODO: get better idea of what is an asset, images, ...
const imageExt = ["png", "jpg"]
export function isAssetReference(url: string) {
  return imageExt.map((ext) => url.endsWith(ext)).some((x) => x)
}
