
const dyUtils = (() => {
  const service = {};

  service.debounce = (func, wait) => {
    var timeout;
    return () => {
      var context = this;

      clearTimeout(timeout);

      timeout = setTimeout(function () {
        timeout = null;
        func.apply(context, []);
      }, wait);

      if (!timeout) {
        func.apply(context, []);
      }
    };
  };

  return service;
})();
