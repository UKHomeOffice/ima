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

## Updating UAN sheets
To upload a new UAN sheet into our S3 buckets, you will need to do the following for our notprod and prod buckets:

1. Setup your local environment to have the relevant access key id, secret access key, kms key id, bucket name and aws region to be able to upload a new object to S3. Please get the assistance of a senior dev/devops who has access to the notprod and prod kube namespaces, if relevant secrets are needed to access the relevant buckets.

2. Place the relevant Excel sheet into the `data` folder and name with the following name convention:
```
uans-<Year>-<Month>-<Day>
```
e.g. uans-data-2023-03-12

3. Go to the bin folder and run the following bash script with the sheet name as the first argument:
```
cd bin
./upload_cases_sheet.sh uans-data-<Year>-<Month>-<Day>
```

4. Update in `config.js` the `casesIds.S3Id` property with the filename, e.g. uans-data-2023-03-12

5. .gitignore file checks entire repo for any .xlsx files to ensure they are not accidentally commited. However, any .xlsx files in the test folder are left alone for unit testing. Please ensure when you are finished you *REMOVE* the relevant sheet as a precaution when you are finished with it. It may be a more automated approach in future where stakeholders upload the sheet to S3 and then the service references it without the above approach needed by the team.


### Database setup and integration

If this is a first-time install get postgres running on the default port and setup a new, empty local database called `ima`.  
Run [hof-rds-api](https://github.com/UKHomeOffice/hof-rds-api) locally for the ima service. Hof-rds-api is an api that will read and write to your local database.  
Follow the instructions in the [hof-rds-api README](https://github.com/UKHomeOffice/hof-rds-api/blob/master/README.md) to setup the correct configuration for your local `ima` database and run the api in relation to ima.

### Environment Variables

The basic environment variables for local development of IMA core routes are:

- `NOTIFY_KEY`: The GovUK Notify key
- `DATASERVICE_SERVICE_PORT_HTTPS`: The port you are running hof-rds-api on
- `AWS_BUCKET`: The s3 bucket to which files are upload
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_KMS_KEY_ID`: AWS credentials
- `AWS_SIGNATURE_VERSION`: AWS config
- `AWS_REGION`: AWS config

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
