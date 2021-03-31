abstract class HttpError extends Error {
  public status!: number;
}

export class FailedToGetAllReposError extends HttpError {
  constructor(org: string, correctNumRepos: number, actualNumRepos: number) {
    super(
      `Failed to get all repositories for organization ${org} from GitHub API. Expected ${correctNumRepos} but got ${actualNumRepos}`
    );

    this.status = 500;
  }
}

export class BadRequest extends HttpError {
  constructor(message = "Bad Request") {
    super(message);

    this.status = 400;
  }
}
