/**
 * @description YouTube Video Preview Settings class
 *              communicate with YtStorage for retrieving/updating settings
 *
 * @requires YtStorage
 */
var YtSettings = (function () {
  "use strict";
  /*global console, YtStorage, PROPR_IMAGE_TIME, PROPR_IMAGE_REAL_SIZE, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM, PROPR_VIEW_RATING, PROPR_RATING_HEIGHT */
  var my;
  my = {
    initialized: false,
    /**
     * @description Application properties
     */
    propr: {},
    /**
     * @description Boolean properties, used for filtering
     */
    booleanPropr: [
      PROPR_IMAGE_REAL_SIZE,
      PROPR_VIEW_RATING,
      PROPR_SHOW_ICON,
      PROPR_HIDE_ICON_CONFIRM
    ],
    /**
     * @description Number properties, used for filtering
     */
    numberPropr: [
      PROPR_IMAGE_TIME,
      PROPR_RATING_HEIGHT
    ],
    /**
     *
     * @description Filter boolean value
     * @param {String} val
     * @returns {Boolean}
     */
    filterBool: function (val) {
      if (val === false || val === "false") {
        return false;
      }
      return true;
    },
    /**
     *
     * @description Filter property
     * @param {String} proprName
     * @param {String|Number|Boolean} proprVal
     * @returns {String|Number|Boolean}
     */
    filterPropr: function (proprName, proprVal) {
      var proprNameIndex;
      if (proprName) {
        proprNameIndex = my.booleanPropr.indexOf(proprName);
        if (proprNameIndex > -1) {
          proprVal = my.filterBool(proprVal);
        } else {
          proprNameIndex = my.numberPropr.indexOf(proprName);
          if (proprNameIndex > -1) {
            proprVal = parseInt(proprVal, 10);
            if (isNaN(proprVal)) {
              proprVal = my.propr[proprName];
            }
          }
        }
      }
      return proprVal;
    },
    /**
     *
     * @description Set properties
     * @param {String} proprName
     * @param {String} proprVal
     * @param {Function} cbFn
     * @param {Array} cbArgs
     */
    setPropr: function (proprName, proprVal, cbFn, cbArgs) {
      proprVal = my.filterPropr(proprName, proprVal);
      my.propr[proprName] = proprVal;
      YtStorage.setItem(proprName, proprVal);
      if (cbFn) {
        cbArgs = cbArgs || [];
        cbArgs.unshift(proprVal);
        cbArgs.unshift(proprName);
        cbFn.apply(null, cbArgs);
      }
    },
    /**
     * @description At properties initialization callback
     * @param {Object} items
     */
    initCb: function (items) {
      var proprName;
      for (proprName in my.propr) {
        if (my.propr.hasOwnProperty(proprName)) {
          if (items.hasOwnProperty(proprName)) {
            my.propr[proprName] = my.filterPropr(proprName, items[proprName]);
          } else {
            YtStorage.setItem(proprName, my.propr[proprName]);
          }
        }
      }
      my.initialized = true;
    },
    /**
     *
     * @description Initialize settings
     */
    init: function () {
      var proprNames;
      my.propr[PROPR_IMAGE_TIME] = 1000;
      my.propr[PROPR_VIEW_RATING] = true;
      my.propr[PROPR_SHOW_ICON] = true;
      my.propr[PROPR_HIDE_ICON_CONFIRM] = true;
      my.propr[PROPR_RATING_HEIGHT] = 4;
      my.propr[PROPR_IMAGE_REAL_SIZE] = false;
      proprNames = [PROPR_IMAGE_TIME, PROPR_IMAGE_REAL_SIZE,
        PROPR_VIEW_RATING, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM, PROPR_RATING_HEIGHT];
      YtStorage.getAll(proprNames, my.initCb);
    },
    /**
     *
     * @description Test class initialized and if not initialize it
     * @param {String} proprName
     * @param {Function} cbFn
     * @param {Array} cbArgs
     */
    testInitialized: function (proprName, cbFn, cbArgs) {
      if (!my.initialized) {
        console.log("settings not initialized!");
      } else {
        if (cbFn) {
          cbArgs = cbArgs || [];
          if (proprName === "all") {
            cbArgs.unshift(my.propr);
          } else {
            cbArgs.unshift(my.propr[proprName]);
          }
          cbArgs.unshift(proprName);
          cbFn.apply(null, cbArgs);
        }
      }
    },
    /**
     *
     * @description Get properties
     * @param {String} proprName
     * @param {Function} cbFn
     * @param {Array} cbArgs
     */
    getPropr: function (proprName, cbFn, cbArgs) {
      my.testInitialized(proprName, cbFn, cbArgs);
    },
    /**
     *
     * @description Get all properties
     * @param {Function} cbFn
     * @param {Array} cbArgs
     */
    getSettings: function (cbFn, cbArgs) {
      my.testInitialized("all", cbFn, cbArgs);
    }
  };
  my.init();
  //public
  return {
    getSettings: my.getSettings,
    getPropr: my.getPropr,
    setPropr: my.setPropr,
    isInit: function () {
      return my.initialized;
    }
  };
}());
