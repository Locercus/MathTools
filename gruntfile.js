module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            build: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    'style.css': 'style/main.less'
                }
            }
        },
        autoprefixer: {
            build: {
                files: {
                    'style.css': 'style.css'
                }
            }
        },
        watch: {
            styles: {
                files: [
                    'style/*.less'
                ],
                tasks: [
                    'less', 'autoprefixer'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less', 'autoprefixer', 'watch']);
};
