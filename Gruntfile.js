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
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            }
        },
        jshint: {

            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'server.js',
                '*.js',
                'backend/{,*/}*.js'
            ],

            test: {
                options: {
                    jshintrc: 'test.jshintrc'
                },
                all: [
                    'test/{,*/}*.js'
                ]
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
        'jshint'//,
//        'test'
    ]);

    grunt.registerTask('test', [
        'mochaTest'
    ]);

    grunt.registerTask('default', [
        'jshint'//,
//        'test',
//        'build'
    ]);
};
