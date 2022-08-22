# B2C API
A REST API for managing customer data
## Installing the application
### Requirements
- As this project is a Javascript project, it requires `node` (v12) and `npm`.
- MongoDB. This application uses MongoDB as a database. Therefore, it is useful to have some kind of MongoDB client installed (we recommend [Robo3T](https://robomongo.org) and [Studio 3T](https://studio3t.com/download/)).


### MongoDB connection
When running the application locally, the application will try to connect to the MongoDB at [localhost:27017/](http://localhost:27017/).
You can provision a local mongo database using docker-compose defined in [`local/`](local/).



### Running the application

Clone the repository and run the following command to install the dependencies:
Install [Node.js and NPM](https://nodejs.org/en/download/)

- on OSX use [homebrew](http://brew.sh) `brew install node`
- on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

### Install yarn globally

```bash
yarn global add yarn
```


### Install

- Install all dependencies with `yarn install`

```
yarn install
```
now, you should be able to run tests for this project with
```
npm test
```
and start the application with

```bash
yarn start serve
```


### Linting

- Run code quality analysis using `yarn start lint`. This runs tslint.
- There is also a vscode task for this called `lint`.


While it is running, you should be able to hit the explorer at [localhost:3000/explorer/](http://localhost:3000/explorer/).


## Structure
This repository is broken down into a few main directories, which are explained below:
```
.
├── Dockerfile        # The image description
├── test              # Scripts for running unit, e2e and integration tests
├── src               # Contains source files for the API
├── local             # Configuration for setting up a local mongo cluster and spining up the API using docker-compose

```

### Local Environment Bootstrap
The `docker-compose` files are provided in the `local` directory to help easily start up your necessary dependencies for local testing:

# Running B2C-API locally using docker-compose
You can run B2C-API locally with the command
```bash
cd local
docker-compose up
```
which will build/deploy the following on your local system:
- MongoDB
  - Filled with a bare essential dataset: just the necessary default Customers and Address data.
  - Connecting to this DB can be done with the username `user` and password `pass`.
- B2C-API
  - Available on port 3000.

If you want to re-build the B2C-API image after you've made some changes locally, you'll have to run the docker-compose command with the `--build` flag
```bash
docker-compose up --build
```
If you don't provide this flag, the docker-compose stack will be booted up with whatever was built previously, regardless of any local changes.


## Running Tests
### Running Tests Using the Command Line
Below is a list of commands to run tests:
- `npm test` - runs all tests
- `npm start test.unit` - runs all unit tests.It is helpful to see how much the unit tests cover themselves as they are more concrete and precise in
terms of pure functionality.
- `npm start test.integration` - runs all the integration tests
- `npm run test:e2e` - runs all the end to end tesrs


### Unit Tests
Unit tests are located in `test/unit`. 

### Integration Tests
A set of integration tests suites are defined in [`test/integration`](test/integration). 

## ❯ API Routes

The route prefix is `/api` by default, but you can change this in the .env file.
The swagger can be altered in the `.env` file.

| Route          | Description |
| -------------- | ----------- |
| **/api**       | Shows us the name, description and the version of the package.json |
| **/explorer**   | This is the Swagger UI with our API documentation |
| **/api/customers** | Example entity endpoint |


## ❯ API Payload
   The following is a sample request payload which can be used to the create new customer or update an existing customer
   ```json
{
    "name": "Tosh Jay",
    "phoneNumber": "+10989765612",
    "email": "abc@abc.com",
    "address": {
      "city": "Halifax",
      "houseNumber": 56,
      "province": "Nova Scotia",
      "streetName": "Lacewood"
    }
  }
```

## Development, Deployment and Production Release
### Feature Development
- On your machine, create a (feature) branch off `develop`. Usually these branches are given names of the form `feature/WEBAPI-1234`, `bugfix/WEBAPI-1234`, or `offboard/some-improvement`.
- Make your changes, commit them to the feature branch, and push the branch to Gitlab.
- Open your MR against `develop` (use the template provided).
- Allow some time for the MR to be reviewed.


