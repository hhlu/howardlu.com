document.documentElement.className += 'wf-loading';

WebFontConfig = {
    google: {
        families: [
            'Oswald',
            'Quattrocento:400,700',
            'Open+Sans:300,400italic,400,700',
            'Bree+Serif'
        ]
    },
    custom: {
        families: ['Mono Social Icons Font'],
        urls: ['/css/fonts/monosocialiconsfont.css']
    },
    active: function() {
        if ('function' == typeof redrawBeforeAfterElements) {
            redrawBeforeAfterElements();
        }
    },
    fontactive: function(familyName, fvd) {
        if ('Mono Social Icons Font' == familyName) {
            if ('function' == typeof redrawBeforeAfterElements) {
                redrawBeforeAfterElements();
            }
        }
    },
    timeout: 10000
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
