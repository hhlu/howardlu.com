var disqus_shortname = 'howardlu';

$(function() {
    var $nav = $('nav.navbar');
    var $header = $('header.main');

    $(window).bind('scroll resize', function() {
        if (
            $(this).scrollTop() >= $header.offset().top + $header.innerHeight()
        ) {
            $nav.css({
                position: 'fixed',
                top: 0
            });
        }
        else {
            $nav.css({
                position: 'absolute',
                top: 'auto'
            });
        }
    });

    var blogSearch = new BlogSearch();
    blogSearch.bindControls();
    blogSearch.bindSearch();
});
