'use strict';
/**
 * 获取窗体滚动信息
 * @return {Object} 包含滚动信息的对象
 */
Window.prototype.getScroll = function() {
  return {
    x: (this.pageXOffset !== undefined) ? this.pageXOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollLeft,
    y: (this.pageYOffset !== undefined) ? this.pageYOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollTop
  };
};

/**
 * 优化滚动事件
 * @param  {Object} function(window [description]
 * @return {[type]}                 [description]
 */
(function(window) {
  var throttle = function(type, name, target) {
    var obj = target || window;
    var running = false;
    var func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle('scroll', 'optimizedScroll');
})(window);
