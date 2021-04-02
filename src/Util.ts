//export type AppImageData = string | ArrayBuffer;

import ImageElementInfo from "./ImageElementInfo";

export default class Util {
  static GetBase64Image(image: Blob): Promise<ImageElementInfo> {
    return new Promise<ImageElementInfo>((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.addEventListener(
          "load",
          () => {
            const imageElm = new Image();
            imageElm.onload = function() {
              resolve(new ImageElementInfo(reader.result, imageElm.width,imageElm.height));
            }
            imageElm.src = (reader.result as any) as string;
          },
          false
        );
        reader.readAsDataURL(image);
      } catch (err) {
        reject(err);
      }
    });
  }
}
