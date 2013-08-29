desc 'Deploys site to hhlu/hhlu.github.com'
task :deploy => [:build, :minify_html] do
    print 'Continue with deployment? (y/n) '

    deploy = true ? 'y' == $stdin.gets.chomp() : false
    if deploy
        deploy_dir = '_deploy'

        puts 'Deploying site...'

        %x[mkdir #{deploy_dir}]
        %x[git clone https://github.com/hhlu/hhlu.github.com.git #{deploy_dir}]
        %x[find #{deploy_dir}/* ! -path '.' ! -path '*/.git*' -exec rm -rf {} +]
        %x[cp -a _site/* #{deploy_dir}]
        %x[cd #{deploy_dir} && git add -A * && git push]

        deploy_cleanup()
    else
        puts 'Deployment aborted'

        deploy_cleanup()
        abort()
    end
end

desc 'Generates static site files with Jekyll'
task :build => [:minify_css, :minify_js] do
    print 'Building site...'
    %x[jekyll build]
    puts ' done'
end

desc 'Minifies CSS files'
task :minify_css do
    css_folder = '_includes/css'

    print 'Minifying CSS...'
    files = %x[find #{css_folder} -maxdepth 1 -name '*.css' -printf '%f\n'] \
        .split(/\n/)

    files.each do |file|
        %x[yui --type css --charset utf-8 \
            -o #{css_folder}/minified/#{file} \
            #{css_folder}/#{file}]
    end

    puts ' done'
end

desc 'Minifies JavaScript files'
task :minify_js do
    js_folder = '_includes/js'

    print 'Minifying JS...'
    files = %x[find #{js_folder} -maxdepth 1 -name '*.js' -printf '%f\n'] \
        .split(/\n/)

    files.each do |file|
        %x[closure --js #{js_folder}/#{file} \
            --js_output_file #{js_folder}/minified/#{file}]
    end

    puts ' done'
end

desc 'Minifies HTML files'
task :minify_html => [:build] do
    site_folder = '_site'

    print 'Minifying HTML...'
    %x[htmlcompressor --type html --charset utf-8 --recursive --compress-js \
        --compress-css --js-compressor closure -o #{site_folder} #{site_folder}]

    puts ' done'
end

def deploy_cleanup()
    %x[rm -rf _deploy]
end
