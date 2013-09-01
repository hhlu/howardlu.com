module Jekyll
    module Generators
        class TagPagination < Generator
            safe true

            def generate(site)
                if site.layouts.key?('tag')
                    site.tags.keys.each do |tag|
                        paginate(site, tag)
                    end
                end
            end

            def paginate(site, tag)
                tag_posts = site.posts.find_all { |post|
                    post.tags.include?(tag)
                }.sort_by { |post|
                    -post.date.to_f
                }
                num_pages = TagPager.calculate_pages(
                    tag_posts,
                    site.config['paginate'].to_i
                )

                (1..num_pages).each do |page|
                    pager = TagPager.new(
                        site,
                        page,
                        tag_posts,
                        tag,
                        num_pages
                    )

                    dir = TagPager.paginate_path(site, page, tag)
                    page = TagPage.new(site, site.source, dir, tag)
                    page.pager = pager
                    site.pages << page
                end
            end
        end

        class TagPager < Pager
            PAGINATE_PATH_PREFIX = 'tag/:tag'

            attr_reader :tag
            alias_method :liquid_hash, :to_liquid

            def initialize(site, page, all_posts, tag, num_pages = nil)
                super site, page, all_posts, num_pages

                @tag = tag
                @previous_page_path = TagPager.paginate_path(site, @previous_page, tag)
                @next_page_path = TagPager.paginate_path(site, @next_page, tag)
            end

            def self.paginate_path(site, num_page, tag)
                paginate_path_prefix = self::PAGINATE_PATH_PREFIX
                paginate_path_prefix = paginate_path_prefix.sub(':tag', tag.downcase())

                if num_page.nil? || num_page <= 1
                    format = paginate_path_prefix
                else
                    format = File.join(
                        paginate_path_prefix,
                        site.config['paginate_path']
                    )
                    format = format.sub(':num', num_page.to_s)
                end

                ensure_leading_slash(format)
            end

            def to_liquid
                liquid_hash = self.liquid_hash
                liquid_hash['tag'] = @tag

                liquid_hash
            end
        end
    end
end
