# Running B2C-API locally in docker-compose
You can run B2C-API locally with the command
```bash
docker-compose up
```
which will build/deploy the following on your local system:
- MongoDB
  - Filled with a bare essential dataset: just the necessary Address and Customer data.
  - Connecting to this DB can be done with the username `user` and password `pass`.
- B2C-API
  - Available on port 3000.

If you want to re-build the B2C-API image after you've made some changes locally, you'll have to run the docker-compose command with the `--build` flag
```bash
docker-compose up --build
```
If you don't provide this flag, the docker-compose stack will be booted up with whatever was built previously, regardless of any local changes.

