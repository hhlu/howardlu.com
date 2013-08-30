require 'webrick'

STAGE_DIR = '_stage'
BUILD_DIR = '_site'

BUILD_CSS_DIR = BUILD_DIR + '/css'
BUILD_JS_DIR = BUILD_DIR + '/js'

BUILD_CSS = BUILD_CSS_DIR + '/site.css'
BUILD_JS = BUILD_JS_DIR + '/site.js'

desc 'Deploys site to hhlu/hhlu.github.com'
task :deploy => [:build] do
    print 'Continue with deployment? (y/n) '

    deploy = true ? 'y' == $stdin.gets.chomp() : false
    if deploy
        puts 'Deploying site...'

        %x[mkdir #{STAGE_DIR}]
        %x[git clone https://github.com/hhlu/hhlu.github.com.git #{STAGE_DIR}]
        %x[find #{STAGE_DIR}/* ! -path '.' ! -path '*/.git*' -exec rm -rf {} +]
        %x[cp -a #{BUILD_DIR}/* #{STAGE_DIR}]
        %x[cd #{STAGE_DIR} && git add -A * && git push]

        deploy_cleanup()
    else
        puts 'Deployment aborted'

        deploy_cleanup()
        abort()
    end
end

desc 'Serves the site locally'
task :serve => [:build] do
    server = WEBrick::HTTPServer.new(
        :BindAddress => '10.0.2.15',
        :Port => 4000,
        :DocumentRoot => BUILD_DIR
    )
    trap('INT') do
        server.shutdown
    end
    server.start
end

desc 'Generates static site files with Jekyll'
task :build do
    puts 'Building site...'
    %x[jekyll build]

    js_minify_thread = Thread.new {
        minify_build_js()
    }
    css_minify_thread = Thread.new {
        minify_build_css()
    }
    html_minify_thread = Thread.new {
        minify_build_html()
    }

    js_minify_thread.join()
    css_minify_thread.join()
    html_minify_thread.join()
end

# Minifies the CSS file specified by BUILD_CSS.
#
def minify_build_css()
    puts 'Minifying CSS...'
    %x[yui --type css --charset utf-8 -o #{BUILD_CSS} #{BUILD_CSS}]
end

# Minifies the JavaScript file specified by BUILD_JS.
#
def minify_build_js()
    puts 'Minifying JS...'
    %x[closure --js #{BUILD_JS} --js_output_file #{BUILD_JS}.tmp]
    %x[mv #{BUILD_JS}.tmp #{BUILD_JS}]
end

# Recursively minifies all HTML files found in BUILD_DIR.
#
def minify_build_html()
    puts 'Minifying HTML...'
    %x[htmlcompressor --type html --charset utf-8 --recursive --compress-js \
        --compress-css --js-compressor closure -o #{BUILD_DIR} #{BUILD_DIR}]
end

# Deletes the directory specified by STAGE_DIR.
#
def deploy_cleanup()
    %x[rm -rf #{STAGE_DIR}]
end
