# integrate-github-api

## Overview and Credit

This project uses GitHub's v4 API, which is based on GraphQL, to expose a REST API that's with the following functionality:

- Get the names of Google's public repositories
- Write the names of Google's public repositories to a compressed JSON file on the server

Repository structure and some functions, like catchAsyncRequest, are inherited from YouTube series: https://www.youtube.com/playlist?list=PLcCp4mjO-z9_HmJ5rSonmiEGfP-kyRMlI

## Single Command Run

Create a file called `.env` in your current directory with contents:

```txt
GITHUB_TOKEN=<your_github_personal_access_token>
```

Then run:

```bash
docker run --rm -p '3000:3000' --env-file .env mattddean/integrate_github_api:latest
```

> Docker will automatically download the latest version of the container from Docker Hub

### Stopping this container

In another shell, run:

```bash
docker ps # take note of the relevant Container ID
docker stop <container_id>
```

> Replace `<container_id>` with the relevant Container ID you found when running `docker ps`

## Set up development environment

### Dependencies

- Docker

Run the following command to start your dev environment

```bash
CURRENT_USER_ID=$(id -u) CURRENT_GROUP_ID=$(id -g) docker-compose up backend
```

> Docker will connect the container's port 3000 to your host's port 3000

You should now be able to issue API requests on your host machine to localhost:3000

## Building for Production

The app can be easily pushed to your Docker Hub registry as a container with the following commands

```bash
cd api
docker build -t <your_docker_hub_username>/integrate_github_api .
docker login
docker push <your_docker_hub_username>/integrate_github_api
```

> Replace `<your_docker_hub_username>` with your Docker Hub Username
