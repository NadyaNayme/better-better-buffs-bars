import fs from "fs";
import path from "path";

/**
 * A custom Vite plugin to replicate the functionality of alt1/imagedata-loader and alt1/font-loader.
 * @returns {import('vite').Plugin}
 */
export default function alt1Plugin() {
  return {
    // A name for the plugin (good practice)
    name: "vite-plugin-alt1",

    /**
     * The transform hook is called for each module request.
     * We can intercept requests for our special file types here.
     * @param {string} code The original source code of the file.
     * @param {string} id The absolute path of the file.
     */
    transform(code, id) {
      // --- Handle .data.png files ---
      if (id.endsWith(".data.png")) {
        console.log(`[alt1-plugin] Transforming image: ${id}`);
        // 1. Read the image file into a buffer.
        const buffer = fs.readFileSync(id);
        // 2. Convert the buffer to a Base64 string, which can be embedded in JS.
        const base64 = buffer.toString("base64");
        
        // 3. Return new JavaScript code. This code, when run in the browser,
        // will import the a1lib, decode the Base64, and export the resulting ImageData.
        return {
          code: `
            import a1lib from 'alt1';
            const base64 = "${base64}";
            export default a1lib.ImageDetect.imageDataFromBase64(base64);
          `,
          map: null // No source map needed
        };
      }

      // --- Handle .fontmeta.json files ---
      if (id.endsWith(".fontmeta.json")) {
        console.log(`[alt1-plugin] Transforming font: ${id}`);
        // 1. Read and parse the font metadata JSON file.
        const meta = JSON.parse(fs.readFileSync(id, "utf-8"));
        
        // 2. The JSON contains a relative path to the font's glyph image.
        // We need to resolve the absolute path to that image.
        const imagePath = path.resolve(path.dirname(id), meta.image);

        // 3. Read the glyph image and convert it to Base64.
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString("base64");

        // 4. Return new JS code. This code will reconstruct the Font object
        // in the browser using the metadata and the embedded Base64 image.
        return {
          code: `
            import a1lib from 'alt1';
            const meta = ${JSON.stringify(meta)};
            const imageBase64 = "${imageBase64}";
            export default a1lib.Font.fromData(meta, imageBase64);
          `,
          map: null
        };
      }

      // For any other file type, return null to let Vite handle it normally.
      return null;
    },
  };
}