module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.initConfig({
    jshint: {
      options: {
        node: true,
        expr: true
      },
      files: ["Gruntfile.js", "src/*.js", "test/*.js"]
    }
  });

  grunt.registerTask("default", "jshint");
};
