//export type AppImageData = string | ArrayBuffer;

import ImageInfo from "./ImageInfo";

export default class Util {
  static GetBase64Image(image: Blob): Promise<ImageInfo> {
    return new Promise<ImageInfo>((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.addEventListener(
          "load",
          () => {
            const imageElm = new Image();
            imageElm.onload = function() {
              resolve(new ImageInfo(reader.result, imageElm.width,imageElm.height));
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
