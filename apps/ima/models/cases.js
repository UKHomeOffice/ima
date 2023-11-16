
const path = require('path');
const fs = require('fs');
const config = require('../../../config');
const XLSXProcessor = require('../../../lib/xlsx-processor');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
  signatureVersion: config.aws.signatureVersion
});

const s3 = new AWS.S3();

module.exports = class Cases {
  constructor(s3Id) {
    this.s3Id = s3Id;
  }

  fetch() {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: config.aws.bucket,
        Key: `uans/${this.s3Id}`
      };
      console.log('bucket params ', params);
      const dataFile = path.join(__dirname + `../../../../data/${this.s3Id}.xlsx`);
      this.#createOrResetFile(dataFile);

      const fileStream = s3.getObject(params).createReadStream();
      const writeStream = fs.createWriteStream(dataFile);

      fileStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  processToJsonFile() {
    let json = XLSXProcessor(this.s3Id);
    console.log(json);

    if (config.env !== 'production') {
      json = json.concat(config.casesIds.testCases);
    }
    const jsonFile = path.join(__dirname + `../../../../data/${this.s3Id}.json`);
    return fs.writeFile(jsonFile, JSON.stringify(json), console.log);
  }

  #createOrResetFile(file) {
    return fs.closeSync(fs.openSync(file, 'w'));
  }
};
