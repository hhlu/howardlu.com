module Jekyll
    class TagPage < Page
        def initialize(site, base, dir, tag)
            @site = site
            @base = base
            @dir = dir
            @name = 'index.html'

            self.process(@name)
            self.read_yaml(File.join(base, '_layouts'), 'tag.html')
            self.data['tag'] = tag
            self.data['title'] = site.config['tag_page_title'] \
                .sub(':tag', tag)
            self.data['description'] = site.config['tag_page_description'] \
                .sub(':tag', tag)
            self.data['lastmod'] = site.time
        end
    end
end
