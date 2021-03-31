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

export class HitRateLimitError extends HttpError {
  constructor(resetAt: string, thirdPartyApi: string) {
    super(`Hit ${thirdPartyApi}'s rate limit. Try again at ${resetAt}`);

    this.status = 503;
  }
}

export class BadRequest extends HttpError {
  constructor(message = "Bad Request") {
    super(message);

    this.status = 400;
  }
}
