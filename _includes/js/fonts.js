document.documentElement.className += 'wf-loading';

WebFontConfig = {
    google: {
        families: [
            'Oswald',
            'Quattrocento:400,700',
            'Open+Sans:300,400italic,400,700',
            'Bree+Serif'
        ]
    }
};

(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();
