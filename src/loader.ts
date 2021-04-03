import { f, logo, image } from "./test";
import Watermark from "./components/Watermark/Watermark";
import { IOption } from "./components/Watermark/IOptions";
import  Util  from "./Util";
import TextElementInfo from "./TextElementInfo";

f("in the name of god");


class Program {
  static watermark: Watermark;

  static main(): void {
    document
      .getElementById("btn-add-image")
      .addEventListener("click", async (_) => {
        const files = (document.getElementById(
          "ctl-image-file"
        ) as any) as HTMLInputElement;
        const file = files.files[0];
        const base64data = await Util.GetBase64Image(file);

        const option: IOption = {
          SvgElement: (document.getElementById(
            "main-svg"
          ) as any) as SVGElement,
          ImageInfo: base64data,
        };
        Program.watermark = new Watermark(option);
      });

    document
      .getElementById("btn-add-logo")
      .addEventListener("click", async (_) => {
        const files = (document.getElementById(
          "ctl-logo-file"
        ) as any) as HTMLInputElement;
        const file = files.files[0];
        const base64data = await Util.GetBase64Image(file);
        Program.watermark.addImageElement(base64data);
      });

    document
      .getElementById("btn-preview")
      .addEventListener("click", async (_) => {
        const imageElement = (document.getElementById(
          "img"
        ) as any) as HTMLImageElement;
        Program.watermark.preview(imageElement);
      });

    // document
    //   .getElementById("btn-download")
    //   .addEventListener("click", async (_) => {
    //     const url = await Program.watermark.exportImage();
    //     const a = document.createElement("a");
    //     a.setAttribute("href", url);
    //     a.setAttribute("download", "fileName.jpeg");
    //     a.click();
    //   });
    document
      .getElementById("btn-download")
      .addEventListener("click", async (_) => {
        await Program.watermark.exportImage();
        
      });

      const option: IOption = {
        SvgElement: (document.getElementById(
          "main-svg"
        ) as any) as SVGElement,
        ImageInfo: image,
      };
      Program.watermark = new Watermark(option);

      Program.watermark.addImageElement(logo);

      const textOption:TextElementInfo={
        FontName:"Arial",
        Text:"god",
        Height:10,
        Width:200
      }

      Program.watermark.addTextElement(textOption);
  }

}

Program.main();
