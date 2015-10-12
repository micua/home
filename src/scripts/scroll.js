(function(window) {
    'use strict';
    var document = window.document;

    // 滚动事件
    // window.addEventListener('scroll', function() {
    //     var scroll = window.getScroll();
    //     document.body.setAttribute('data-scrolled', scroll.y > 0);
    // })
    // window.trigger('scroll');


    function optimizedScroll() {
        var scroll = window.getScroll();
        var offset = document.body.getAttribute('data-scroll-offset') || 5;
        document.body.setAttribute('data-scrolled', scroll.y > offset);
    }
    // handle event
    window.addEventListener('optimizedScroll', optimizedScroll);
    optimizedScroll();
    // window.optimizedScroll();

})(window);
