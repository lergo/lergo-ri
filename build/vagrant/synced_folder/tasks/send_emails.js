var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');

var accessKeyId = process.env.accessKeyId;
var secretAccessKey = process.env.secretAccessKey;
var CI_COMMIT_MESSAGE=process.env.CI_COMMIT_MESSAGE;
var CI_TIMESTAMP=process.env.CI_TIMESTAMP;
var BUILD_NUMBER=process.env.BUILD_NUMBER;

// the aws accessKey and secretAccessKey are from lergo.org
var transporter = nodemailer.createTransport(ses({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region : 'us-east-1'

}));

transporter.sendMail({
    from: 'noreply@lergo.org',
    to: 'jlevym@gmail.com, levy.nava@gmail.com, nava.levy@lergo.org',
    subject: `realstaging has been upgraded`,
    text: `realstaging has been upgraded with the latest commit and is ready for review.
    Build Number:${BUILD_NUMBER}
    BuildID: ${CI_TIMESTAMP}
    Commit Message: ${CI_COMMIT_MESSAGE}`
});
