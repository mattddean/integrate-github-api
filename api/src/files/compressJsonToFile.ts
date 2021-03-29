import { gzip } from "zlib";
import { writeFile } from "fs/promises";

// https://github.com/logzio/logzio-nodejs/tree/49fcd95286a60c9c6ea37bb14076e4245d5fb01e/lib/logzio-nodejs.js#L22
const gzipPromise = (body: any): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    gzip(body, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });

export const compressJsonToFile = async (filePath: string, jsonObject: any) => {
  const bufferObject = Buffer.from(JSON.stringify(jsonObject));
  const zippedData = await gzipPromise(bufferObject);
  await writeFile(filePath, zippedData);
};
