var disqus_shortname = 'howardlu';

$(function() {
    var stickyPanelOptions = {
        savePanelSpace: true
    };
    $('nav.navbar').stickyPanel(stickyPanelOptions);

    var blogSearch = new BlogSearch();
    blogSearch.bindControls();
    blogSearch.bindSearch();
});
