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
            self.data['title'] = 'Archive: "' + tag + '"'
        end
    end
end
