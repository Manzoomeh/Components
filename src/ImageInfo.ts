export default class ImageInfo {
  constructor(
    readonly Data: string | ArrayBuffer,
    readonly Width: number,
    readonly Height: number
  ) {}
}
