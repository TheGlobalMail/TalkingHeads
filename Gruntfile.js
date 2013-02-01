module.exports = function( grunt ) {
  'use strict';

  // grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-recess');

  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({

    // Project configuration
    // ---------------------

    // specify an alternate install location for Bower
    bower: {
      dir: 'app/components'
    },

    // Coffee to JS compilation
    // handlebars: {
    //   compile: {
    //     files: {
    //       "temp/modules/compiled-templates.js": [
    //         "app/modules/*/templates/**/*.hbs"
    //       ]
    //     },
    //     options: {
    //       namespace: 'PolitalkApp.Templates',
    //       processName: function(filename) {
    //         return filename
    //                 .replace(/^app\/modules\//, '')
    //                 .replace(/\.hbs$/, '');
    //       }
    //     }
    //   }
    // },

    recess: {
      dist: {
        src: 'app/styles/main.less',
        dest: 'temp/styles/main.css',
        options: {
          compile: true
        }
      }
    },

    // headless testing through PhantomJS
    mocha: {
      all: ['test/**/*.html']
    },

    // default watch configuration
    watch: {
      recess: {
        files: ['app/styles/*.less'],
        tasks: 'recess reload'
      },
      // handlebars: {
      //   files: [
      //     'app/modules/*/templates/**/*.hbs'
      //   ],
      //   tasks: 'handlebars reload'
      // },
      reload: {
        files: [
          'app/index.html',
          'app/styles/*.css',
          'app/scripts/**/*.js'
        ],
        tasks: 'lint reload'
      }
    },

    // default lint configuration, change this to match your setup:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
    lint: {
      files: [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        '!app/scripts/modernizr.js'
      ],

      options: {
        options: {
          curly: true,
          eqeqeq: true,
          immed: true,
          latedef: true,
          newcap: true,
          noarg: true,
          sub: true,
          undef: true,
          boss: true,
          eqnull: true,
          browser: true,
          node: true
        },
        globals: {
          jQuery: true,
          moment: true,
          Backbone: true,
          _: true,
          $: true,
          d3: true,
          Modernizr: true,
          TalkingHeads: true,
          BubbleChart: true,
          KeyValuePairParser: true,
          monster: true
        }
      }
    },

    // Build configuration
    // -------------------

    // the staging directory used during the process
    staging: 'temp',
    // final build output
    output: 'dist',

    mkdirs: {
      staging: 'app/'
    },

    server: {
      app: 'clean lint recess watch',
      port: 3502
    },

    // Below, all paths are relative to the staging directory, which is a copy
    // of the app/ directory. Any .gitignore, .ignore and .buildignore file
    // that might appear in the app/ tree are used to ignore these values
    // during the copy process.

    // concat css/**/*.css files, inline @import, output a single minified css
    css: {
      'styles/main.css': ['styles/**/*.css']
    },

    // renames JS/CSS to prepend a hash of their contents for easier
    // versioning
    rev: {
      js: 'scripts/*.js',
      css: 'styles/*.css',
      img: ['/images/**', 'components/tgm-bootstrap/img/*']
    },

    // usemin handler should point to the file containing
    // the usemin blocks to be parsed
    'usemin-handler': {
      html: 'index.html'
    },

    // update references in HTML/CSS to revved files
    usemin: {
      html: ['index.html', 'scripts/*.js'],
      css: ['styles/**/*.css']
    },

    // HTML minification
    html: {
      files: ['index.html']
    },

    // Optimizes JPGs and PNGs (with jpegtran & optipng)
    img: {
      dist: '<config:rev.img>'
    }

  });

  grunt.renameHelper('usemin:post:html', 'yeoman-usemin:post:html');
  grunt.registerHelper('usemin:post:html', function(content) {
    content = grunt.helper('yeoman-usemin:post:html', content);

    grunt.log.verbose.writeln('Update JavaScript with src attributes');
    content = grunt.helper('replace', content, /\.src=\\?['"]([^\\'"]+)\\?['"]/gm);
    content = grunt.helper('replace', content, /avatarUrl:\\?['"]([^\\'"]+)\\?['"]/gm);

    return content;
  });

  // Alias the `test` task to run the `mocha` task instead
  grunt.registerTask('test', 'lint mocha');
  grunt.registerTask('test-server', 'grunt-server');
  grunt.registerTask('build', 'intro clean recess mkdirs usemin-handler concat css min img rev usemin copy time');
  grunt.registerTask('build:minify', 'intro clean recess mkdirs usemin-handler concat css min img rev usemin html:compress copy time');
};
