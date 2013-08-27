var disqus_shortname = 'howardlu';

function BlogSearch() {
    var SEARCH_CLOSE_KEY_CODE = 27;
    var MIN_WORD_LENGTH = 3;

    var self = this;
    var $searchOverlay = $('#search');
    var $searchInput = $('#blog-search');
    var $resultContainer = $('#search-results');
    var $toggleLink = $('a.search-toggle');

    this.data = null;

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

                var matches = self.getMatches(phrase.toLowerCase());
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

    this.getMatches = function(phrase) {
        if (!self.data) {
            self.getData();

            return [];
        }

        phrase = _(phrase.split(' ')).compact();
        var matches = _(self.data).filter(function(element) {
            var includeElement = true;

            $.each(phrase, function(index, phrasePart) {
                var foundMatch = false;
                $.each(element.words, function(index, titlePart) {
                    if (
                        titlePart == phrasePart
                        || titlePart.indexOf(phrasePart) === 0
                    ) {
                        foundMatch = true;

                        return false;
                    }
                });

                includeElement = includeElement && foundMatch;
                if (!includeElement) {
                    return false;
                }
            });

            if (!includeElement) {
                return false;
            }

            return true;
        });

        return matches;
    };

    this.getData = function() {
        $.ajax({
            cache: false,
            url: '/search.json',
            dataType: 'json',
            success: function(response, status, request) {
                self.data = $.map(response, function(value, index) {
                    if (value) {
                        value.words = [];

                        if (value.title) {
                            value.words = value.title.toLowerCase().split(' ');
                        }
                        if (value.tags) {
                            value.tags = _(value.tags)
                                .map(function(tag) {
                                    tag = tag.toLowerCase();

                                    return tag;
                                });
                            value.words = _.union(value.words, value.tags);
                        }

                        return value;
                    }
                });

                $searchInput.trigger('keyup');
            }
        });
    }
}

$(function() {
    var stickyPanelOptions = {
        savePanelSpace: true
    };
    $('nav.navbar').stickyPanel(stickyPanelOptions);

    var blogSearch = new BlogSearch();
    blogSearch.bindControls();
    blogSearch.bindSearch();
});
