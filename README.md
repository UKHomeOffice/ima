# ima
Illegal Migration Act Removal Notice Claim Form

## Contents

1. [Install & Run](#install-and-run)

2. [Architecture](#architecture)

3. [Skip email verify step](#skip-email-verify-step)

4. [Microservices](#microservices)

5. [Testing](#testing)

## Install and Run

### Prerequisities

- [Node.js](https://nodejs.org/en/) - Tested against LTS
- NPM (installed with Node.js) - Works with version 18+
- [Redis server](http://redis.io/download) running on the default port

### GovUK Notify

You'll need to have the relevant gov notify API key to run the app. Notify is crucial to user flow functionality throughout the app. Save this value as `NOTIFY_KEY` in your `.env` file.  

### Database setup and integration

If this is a first-time install get postgres running on the default port and setup a new, empty local database called `ima`.  
Run [hof-rds-api](https://github.com/UKHomeOffice/hof-rds-api) locally for the ima service. Hof-rds-api is an api that will read and write to your local database.  
Follow the instructions in the [hof-rds-api README](https://github.com/UKHomeOffice/hof-rds-api/blob/master/README.md) to setup the correct configuration for your local `ima` database and run the api in relation to ima.

### Environment Variables

The basic environment variables for local development of IMA core routes are:

- `NOTIFY_KEY`: The GovUK Notify key
- `DATASERVICE_SERVICE_PORT_HTTPS`: The port you are running hof-rds-api on

A full list of environment variables for extended local integrations can be accessed in the HOF team Keybase.

### Run IMA

First make sure you have the hof-rds-api running for the 'ima' service and a local database setup for it to read and write to. If not follow the steps in the [Database setup and integration](#database-setup-and-integration) section above.

Clone this repository to your local machine then:

```bash
$ cd ima
$ touch .env
$ yarn install
$ yarn start:dev
```

Then visit: [http://localhost:8080/](http://localhost:8080/) For the start page and applicant journey


## Architecture


## Skip email verify step

You can skip the email authentication locally or in some of the testing environments.  You'll need to make sure you have an environment variable `allowSkip=true`. You'll also need an email as part of save and return.  You have 3 options either: using a `skipEmail` environment variable; using a key value paramenter in the url; or both.

1. To use an email environment variable, you'll need to set it like so `skipEmail=sas-hof-test@digital.homeoffice.gov.uk`. You can then go to the following url.

    http://localhost:8080/ima/start?token=skip

2. Set the email in the url to whatever email you like.

    http://localhost:8080/ima/start?token=skip&email=sas-hof-test@digital.homeoffice.gov.uk

3. If you do both, then the app will always use what you've set in the url parameter as the email.

## Microservices

The other services used for IMA include

- [hof-rds-api](https://github.com/UKHomeOffice/hof-rds-api)
- [Html-pdf-converter](https://github.com/UKHomeOffice/html-pdf-converter)
- [filevault](https://github.com/UKHomeOffice/file-vault)

> **Note**: you will need hof-rds-api running locally to successfully run and use IMA's core user flows. You can also run both Html-pdf-converter and file-vault locally if you want to test integration beyond the IMA application.

### Additional Env vars

- `PDF_CONVERTER_URL`: If you are running a local PDF converter this is the url and port it is running on. This URL should be in the format `PDF_CONVERTER_URL=http://localhost:<PORT>/convert`
- `FILEVAULT_URL`: If you are running a filevault locally this is the url and port it is running on. This URL should be in the format `FILEVAULT_URL=http://localhost:<PORT>/file`

## Testing

```bash
$ yarn run test
```
will run all tests.

### Linting Tests

```bash
$ yarn run test:lint
```

### Unit Tests

```bash
$ yarn test:unit
```

If you want to run locally make sure you have different ports for Html-pdf-converter and filevault.  In order to download files from the email link received by caseworker, keycloak env variables KEYCLOAK_TOKEN_URL, KEYCLOAK_SECRET, KEYCLOAK_CLIENT_ID, KEYCLOAK_USERNAME and KEYCLOAK_PASSWORD has to be added as provided by keybase.