// Generated on 2013-10-19 using generator-angular 0.3.0
'use strict';

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

    grunt.initConfig({
        yeoman: yeomanConfig,

        mochaTest: {
            beforeBuild: {
                test: {
                    options: {
                        reporter: 'spec'
                    }
                },
                files: { 'src' : ['test/beforeBuild/mocha/**/*.js'] }
            },
            afterBuild : {
                test: {
                    options: {
                        reporter: 'spec'
                    }

                },
                files:  { 'src'  : ['test/afterBuild/mocha/**/*.js'] }
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
        copy: {
            dist: {
                files: [

                    {
                        expand: true,
                        dest: '<%= yeoman.dist %>',
                        src: [
                            'package.json', 'backend/**/*', 'build/**/*','conf/**/*','public/**/*',
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

            backend: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: {
                    'src': [
                        'Gruntfile.js',
                        'server.js',
                        '*.js',
                        'backend/**/*.js'
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
        'copy'
    ]);



    grunt.registerTask('testBefore', [
        'mochaTest:beforeBuild'
    ]);

    grunt.registerTask('testAfter', [
        'mochaTest:afterBuild'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);
};
