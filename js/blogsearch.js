function BlogSearch() {
    var SEARCH_CLOSE_KEY_CODE = 27;
    var MIN_WORD_LENGTH = 3;

    var self = this;
    var $searchOverlay = $('#search');
    var $searchInput = $('#blog-search');
    var $resultContainer = $('#search-results');
    var $toggleLink = $('a.search-toggle');

    this.posts = null;

    this.search = function(phrase) {
        if (!self.posts) {
            self.getPosts();

            return [];
        }

        phrase = _(phrase.split(' ')).compact();
        var matches = _(self.posts).filter(function(element) {
            return _(phrase).every(function(phrasePart) {
                return _(element.words).some(function(word) {
                    return (
                        word == phrasePart
                        || 0 === word.indexOf(phrasePart)
                    );
                });
            });
        });

        return matches;
    };

    this.getPosts = function() {
        $.ajax({
            url: '/search.json',
            dataType: 'json',
            success: function(response, status, request) {
                self.posts = _(response).map(function(post) {
                    post.words = [];

                    if (post.title) {
                        post.words = (post.title).toLowerCase().split(' ');
                    }
                    if (post.tags) {
                        post.tags = _(post.tags)
                            .map(function(tag) {
                                tag = tag.toLowerCase();

                                return tag;
                            });

                        post.words = _.union(post.words, post.tags);
                    }

                    return post;
                });

                $searchInput.trigger('keyup');
            }
        });
    }

    this.bindControls = function() {
        $toggleLink.click(function(e) {
            e.preventDefault();

            $searchOverlay.fadeToggle();
            $searchInput.focus();
        });
        $(document).keyup(function(e) {
            if (SEARCH_CLOSE_KEY_CODE == e.keyCode) {
                $searchOverlay.fadeOut();
            }
        });
    };

    this.bindSearch = function() {
        $searchInput.keyup(_(function() {
            var $resultList = $('ul', $resultContainer);

            var phrase = $(this).val();
            if (phrase.length >= MIN_WORD_LENGTH) {
                $resultList.empty();

                var matches = self.search(phrase.toLowerCase());
                if (!matches || !matches.length) {
                    $resultList.append('<li>No results found</li>');

                    return false;
                }

                $.each(matches, function(index, match) {
                    $resultList.append(
                        '<li> \
                            <span class="date">' + match.date + '</span> \
                            <a href="' + match.url +  '">' + match.title + '</a> \
                        </li>'
                    );
                });

                return true;
            }
        }).debounce(100));
    };
}
