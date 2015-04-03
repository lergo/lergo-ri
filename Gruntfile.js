// Generated on 2013-10-19 using generator-angular 0.3.0
'use strict';

var logger = require('log4js').getLogger('Gruntfile');
var path = require('path');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    try {
        yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
    } catch (e) {
    }

    var s3Config = {};


    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            develop: {
                files: ['backend/**/*', 'test/**/*'],
                tasks: ['concurrent:develop']
            }
        },
        concurrent: {
            develop: [
                'jsdoc',
                'jshint',
                'mocha_istanbul'
            ],
            test: [
                'compass'
            ],
            dist: [
                'compass:dist',
                'htmlmin'
            ]
        },
        s3:{
            uploadCoverage: {
                options: {
                    accessKeyId: s3Config.accessKey,
                    secretAccessKey: s3Config.secretAccessKey,
                    bucket: s3Config.bucket,
                    enableWeb:true,
                    cacheTTL: 0,
                    sslEnabled: false,
                    gzip:true
                },
                cwd: 'coverage/',
                src: '**',
                dest: 'ri-coverage/'

            },
            uploadDocs:{
                options: {
                    accessKeyId: s3Config.accessKey,
                    secretAccessKey: s3Config.secretAccessKey,
                    bucket: s3Config.bucket,
                    enableWeb:true,
                    cacheTTL: 0,
                    sslEnabled: false,
                    gzip:true
                },
                cwd: 'doc/',
                src: '**',
                dest: 'ri-docs/'
            },
            uploadBuildStatus: {
                options: {
                    accessKeyId: s3Config.accessKey,
                    secretAccessKey: s3Config.secretAccessKey,
                    bucket: s3Config.bucket,
                    cacheTTL: 0,
                    sslEnabled: false,
                    enableWeb:true,
                    gzip:true
                },
                cwd: 'buildstatus/',
                src: '**'
            }
        },

        jsdoc : {
            dist : {
                src: ['backend/**/*.js', 'test/**/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },

        mochaTest: {
            unit: {
                test: {
                    options: {
                        reporter: 'spec'
                    }
                },
                files: { 'src': ['test/unittests/mocha/**/*.js'] }
            },
            beforeBuild: {
                test: {
                    options: {
                        reporter: 'spec'
                    }
                },
                files: { 'src': ['test/beforeBuild/mocha/**/*.js'] }
            },
            afterBuild: {
                test: {
                    options: {
                        reporter: 'spec'
                    }

                },
                files: { 'src': ['test/afterBuild/mocha/**/*.js'] }
            }
        },
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.dist %>/*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },
        /*jshint camelcase: false */
        mocha_istanbul: {
            coverage: {
                'src' : 'test/unittests/mocha/**/*'
            }
        },
        copy: {
            dist: {
                files: [

                    {
                        expand: true,
                        dest: '<%= yeoman.dist %>',
                        src: [
                            'package.json', 'backend/**/*', 'build/**/*', 'conf/**/*', 'public/**/*',
                            'swagger-ui/**/*',
                            'emails/**/*',
                            'server.js',
                            '*.sh',
                            'LICENSE'
                        ]
                    }
                ]
            }
        },
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            backend: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: {
                    'src': [
                        'Gruntfile.js',
                        'server.js',
                        '*.js',
                        'backend/**/*.js',
                        '!backend/dataUpgrades/**/*.js'
                    ]
                }
            },

            test: {
                options: {
                    jshintrc: 'test.jshintrc'
                },
                files: {
                    'src': [
                        'test/**/*.js'
                    ]
                }
            }
        }
    });


    gurnt.registerTask('readS3Credentials', function(){
        try {
            var s3path = process.env.LERGO_S3 || path.resolve('./dev/s3.json');
            logger.info('looking for s3.json at ' , s3path );
            s3Config = require( s3path );
        }catch(e){
            logger.error('s3 json is undefined, you will not be able to upload to s3',e);
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'jsdoc',
        'test',
        'copy'
    ]);


    grunt.registerTask('test', [
        'mocha_istanbul'
    ]);

    grunt.registerTask('testBefore', [
        'mochaTest:beforeBuild'
    ]);

    grunt.registerTask('testAfter', [
        'mochaTest:afterBuild'
    ]);

    grunt.registerTask('uploadStatus', [
        'readS3Credentials',
        's3'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
