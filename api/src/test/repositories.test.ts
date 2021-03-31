// There are no duplicate repos

// We have the same number of repos as the repositoryCount that we received

// Decompressing and reading the json.gz file yields the same repos that we saved

import request from "supertest";
import { createApp } from "../app";
import { gunzipSync } from "zlib";
import { readFileSync, unlinkSync, existsSync } from "fs";
import { REPO_FILE_OUTPUT_PATH } from "../config";

const app = createApp();

describe("Repository Endpoints", () => {
  it("should not find any duplicate repos", async () => {
    const res = await request(app).get("/v1/google/repositories").send();
    const { body } = res;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length === new Set(body).size);
  });
  it("should find that the decompressed repos file is the same as the direct repos response", async () => {
    // remove (if it exists) the file that gets written by the put request so that we have a clean test
    if (existsSync(REPO_FILE_OUTPUT_PATH)) unlinkSync(REPO_FILE_OUTPUT_PATH);

    // make two requests: one to get the repos and one to write the file
    const res = await request(app).get("/v1/google/repositories").send();
    await request(app).put("/v1/google/repositories/to_file").send();

    // decompress the written JSON file and read it into a buffer
    const compressedFile = readFileSync(REPO_FILE_OUTPUT_PATH);
    const unzippedJsonRepos = gunzipSync(compressedFile);

    // compare that the decompressed repos file is the same as the direct repos response
    expect(JSON.parse(unzippedJsonRepos.toString())).toEqual(res.body); // performs a deep object comparison
  });
  it("should get a response that the route could not be found", async () => {
    const res = await request(app).put("/v1/google/badroute").send();
    expect(res.status).toEqual(404);
    expect(res.body.message).toEqual("Not Found");
  });
});
