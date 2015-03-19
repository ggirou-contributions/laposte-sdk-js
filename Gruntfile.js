'use strict';

module.exports = function (grunt) {
  var gruntConfig;
  gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      default: ['dist', 'tmp']
    },
    mkdir: {
      all: {
        options: {
          create: ['dist/reports', 'dist/doc']
        }
      }
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        force: true,
        jshintrc: 'jshint.json'
      },
      src: [
        'lib/**/*.js',
        'test/*.js',
        '*.js'
      ]
    },
    mochacov: {
      test: {
        options: {
          reporter: 'spec',
          growl: process.stdout.isTTY
        }
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          output: 'dist/reports/coverage.html'
        }
      },
      coveralls: {
        options: {
          coveralls: true,
          output: 'dist/reports/coverage.lcov'
        }
      },
      options: {
        files: ['spec/*.js']
      }
    },
    watch: {
      browserify: {
        files: ['./lib/lp-sdk.js'],
        tasks: ['exec:browserify', 'notify:browserify']
      },
      doc: {
        files: ['./lib/lp-sdk.js', 'Gruntfile.js', 'build/doc/**'],
        tasks: ['yuidoc', 'notify:doc']
      }
    },
    notify: {
      browserify: {
        options: {
          message: 'Browser components updated'
        }
      },
      doc: {
        options: {
          message: 'Doc updated'
        }
      }
    },
    exec: {
      browserify: {
        command: 'node_modules/browserify/bin/cmd.js -t envify -r ./lib/lp-sdk.js:lp-sdk > client/client-lp-sdk.js'
      },
      'browserify-bootstrap': {
        command: 'node_modules/browserify/bin/cmd.js -t envify ./lib/lp-sdk.js client/lp-sdk-bootstrap.js > client/client-lp-sdk-bootstrap.js'
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '/modules/laPosteSdk.html',
        options: {
          paths: 'lib/',
          themedir: 'build/doc/themes/laposte/',
          outdir: 'dist/doc/'
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          'client/client-lp-sdk.min.js': ['client/client-lp-sdk.js'],
          'client/client-lp-sdk-bootstrap.min.js': ['client/client-lp-sdk-bootstrap.js']
        }
      }
    },
    'gh-pages': {
      options: {
        base: 'dist/doc'
      },
      src: ['**']
    }
  };
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  grunt.initConfig(gruntConfig);
  grunt.loadNpmTasks('grunt-notify');
  grunt.registerTask('verify', ['mkdir', 'jshint']);
  grunt.registerTask('test', ['mkdir', 'mochacov:test']);
  grunt.registerTask('coverage', ['mkdir', 'mochacov:test', 'mochacov:coverage']);
  grunt.registerTask('coveralls', ['mkdir', 'mochacov:test', 'mochacov:coveralls']);
  grunt.registerTask('browserify', ['mkdir', 'exec:browserify', 'exec:browserify-bootstrap', 'uglify']);
  grunt.registerTask('doc', ['mkdir', 'yuidoc']);
  grunt.registerTask('publishdoc', ['doc', 'yuidoc', 'gh-pages']);
  grunt.registerTask('default', ['verify', 'coverage']);
};