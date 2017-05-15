
const ajax = (() => {
  const service = {};


  /**
   *
   * @description Ajax request
   * @param {String} reqMethod
   * @param {String} reqUrl
   * @param {String} reqData
   * @param {Array} cbParams
   * @param {Function} successFn
   * @param {Function} errorFn
   */
  service.execute = (reqMethod, reqUrl, reqData, cbParams, successFn, errorFn) => {
    const aSync = true;
    const noCache = false;
    let xhr;
    let concatString;

    cbParams = cbParams || [];

    try {
      xhr = new XMLHttpRequest(); //FireFox, Safari, Chrome, Opera ...
    } catch (e) {
      //console.log(e.message);
    }

    if (xhr) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            //XHR request is ok
            if (successFn) {
              cbParams.unshift(xhr.responseText);
              successFn.apply(null, cbParams);
              cbParams.shift(); //remove first element
            }
          } else {
            //ERROR
            if (errorFn) {
              errorFn(xhr.status);
            }
          }
        }
      };
      try {
        concatString = '?';
        if (noCache === true) {
          reqUrl = reqUrl + '?_dy_no_cache__' + (new Date()).getTime();
          concatString = '&';
        }
        if (reqMethod.toUpperCase() === 'GET') {
          reqUrl = reqUrl + concatString + reqData;
          reqData = null;
        }
        xhr.open(reqMethod, reqUrl, aSync);
        //xhr.setRequestHeader('Content-type', 'application/json', true);
        try {
          xhr.send(reqData);
        } catch (eS) {
          //we have error when sending request
          //console.log(eS.message);
        }
      } catch (eL) {
        //we have error when loading request
        //console.log(eL.message);
      }
    } else {
      //cannot execute request
      console.log('Cannot initialize XHR request');
    }
  };

  return service;
})();
