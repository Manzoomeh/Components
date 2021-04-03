//export type AppImageData = string | ArrayBuffer;

import ImageElementInfo from "./ImageElementInfo";

export default class Util {
  static GetBase64Image(image: Blob): Promise<ImageElementInfo> {
    return new Promise<ImageElementInfo>((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.addEventListener(
          "load",
          () => resolve(new ImageElementInfo(reader.result)),
          false
        );
        reader.readAsDataURL(image);
      } catch (err) {
        reject(err);
      }
    });
  }
}
