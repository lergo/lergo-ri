'use strict';

var logger = require('log4js').getLogger('Gruntfile');

module.exports = function (grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var s3Config = {};
    try {
        var s3path = process.env.LERGO_S3 || path.resolve('./dev/s3.json');
        logger.info('looking for s3.json at ', s3path);
        s3Config = require(s3path);
    } catch (e) {
        logger.error('s3 json is undefined, you will not be able to upload to s3', e);
    }

    var buildNumber = process.env.BUILD_NUMBER;
    var jobName = process.env.JOB_NAME;
    var artifactsHome = process.env.ARTIFACTS_HOME;

    grunt.initConfig({
        s3: {
            uploadArtifacts: {
                options: {
                    accessKeyId: s3Config.accessKey,
                    secretAccessKey: s3Config.secretAccessKey,
                    bucket: 'lergo-backups',
                    enableWeb: false,
                    cacheTTL: 0,
                    sslEnabled: false,
                    gzip: false
                },
                cwd: artifactsHome + '/',
                src: '**',
                dest: 'artifacts/' + jobName + '-' + buildNumber + '/jobs/' + jobName + '/' + buildNumber + '/' // this path was inspired by jenkins' plugin

            },
            uploadArtifactsLatest: {
                options: {
                    accessKeyId: s3Config.accessKey,
                    secretAccessKey: s3Config.secretAccessKey,
                    bucket: 'lergo-backups',
                    enableWeb: false,
                    gzip: false,
                    cacheTTL: 0,
                    sslEnabled: false,
                    public: true,
                    overwrite: true
                },
                cwd: artifactsHome + '/',
                src: '**',
                dest: 'artifacts/latest/' // this path was inspired by jenkins' plugin

            }
        }
    });
};
