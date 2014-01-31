"use strict";

module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.initConfig({
    jshint: {
      options: {
        node: true,
        expr: true,
        proto: true,
        globalstrict: true,
        globals: {
          describe: false,
          it: false,
          before: true,
          beforeEach: true
        }
      },
      files: ["Gruntfile.js", "src/*.js", "test/*.js"]
    }
  });

  grunt.registerTask("default", "jshint");
};
