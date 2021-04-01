# integrate-github-api

## Overview and Credit

This project uses GitHub's v4 API, which is based on GraphQL, to expose a REST API that's with the following functionality:

- GET /v1/<github_organization_name>/repositories
  - Get the names of <github_organization_name>'s public repositories
- PUT /v1/<github_organization_name>/repositories/to_file
  - Write the names of <github_organization_name>'s public repositories to a compressed JSON file on the server

Repository structure and some functions, like catchAsyncRequest, are inherited from YouTube series: https://www.youtube.com/playlist?list=PLcCp4mjO-z9_HmJ5rSonmiEGfP-kyRMlI

## Single Command Run

Create a file called `.env` in the directory from which you'll run the Docker container with contents:

```txt
THIRD_PARTY_TOKEN=<your_github_personal_access_token>
```

Then run:

```bash
docker run --rm -p '3000:3000' --env-file .env mattddean/integrate_github_api:latest
```

> You should now be able to issue REST requests to http://localhost:3000 and receive responses from the Node.js application running in the container you just started.

Then, to get a shell into this running container to verify that the /tmp/knock_interview.json.gz file was successfully created, run:

```bash
docker ps # note the Container ID associated with the mattddean/integrate_github_api:latest image
docker exec -it <container_id> bash
```

To stop the image, run:

```bash
docker ps # note the Container ID associated with the mattddean/integrate_github_api:latest image
docker stop <container_id>
```

> Docker will automatically download the image from Docker Hub

> Note that because the app is running in Docker, it will write the /tmp/knock_interview.json.gz to the container's filesystem, not to the host filesystem

### Stopping this container

In another shell, run:

```bash
docker ps # take note of the relevant Container ID
docker stop <container_id>
```

> Replace `<container_id>` with the relevant Container ID you found when running `docker ps`

## GraphQL Rationale

Using GitHub's GraphQL API rather than their REST one gives me two benefits:

- I can demonstrate my ability to use / adapt to GraphQL
- Best chance of avoiding deprecation
  - GitHub's GraphQL API is their newest API. In fact, they call it "V4" of their API rather than just a GraphQL version of V3. If further development is needed on this integration project, we're most likely to have access to GitHub's newest features if we use their newest API.

## Update to latest Docker Image

```bash
docker pull mattddean/integrate_github_api:latest
```

## Set up development environment

### Host Machine Dependencies

- Docker

### Setting up your dev environment for the first time

You'll only need to perform these tasks once for a new host machine.

Create a <repo_root>/api/.env file with the following contents:

```txt
THIRD_PARTY_TOKEN=<your_github_personal_access_token>
```

> This is needed in order to authenticate on GitHub's v4 GraphQL API. See this page for instructions on creating a GitHub Personal Access Token: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

Install npm dependencies:

```bash
docker-compose run backend bash
# in the shell that opens...
npm install
exit
```

### Starting your dev environment

Run the following command to start your dev environment:

```bash
CURRENT_USER_ID=$(id -u) CURRENT_GROUP_ID=$(id -g) docker-compose up backend
```

> Docker will connect the container's port 3000 to your host's port 3000

You should now be able to issue API requests on your host machine to localhost:3000

### Get a shell in your Docker dev environment

With the backend container "up", run the following in another shell:

```bash
docker-compose exec backend bash
```

## Run tests

In [your Docker dev environment's shell](#Get-a-shell-in-your-Docker-dev-environment), run:

```bash
npm run test
```

## Building for Production

The app can be pushed to your Docker Hub registry as a container with the following commands:

```bash
cd api
docker build -t <your_docker_hub_username>/integrate_github_api:latest .
docker login
docker push <your_docker_hub_username>/integrate_github_api:latest
```

> Replace `<your_docker_hub_username>` with your Docker Hub Username.

## TODO

- Add GitHub's GraphQL Schema to our Apollo Client for client-side validation
