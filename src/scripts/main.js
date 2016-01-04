(function(window) {
  'use strict';
  var document = window.document;
  var $window = $(window);

  $window.on('optimizedScroll', function() {
    var scroll = window.getScroll();
    var offset = document.body.getAttribute('data-offset') || 5;
    document.body.setAttribute('data-scrolled', scroll.y > offset);
  }).trigger('optimizedScroll');


  new WOW().init();

})(window);
