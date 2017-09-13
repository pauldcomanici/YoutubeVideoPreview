/**
 * @description Class for Options page
 */
(function () {
  "use strict";
  /*global window, document, chrome, CustomEvent, DyDomHelper, PROPR_IMAGE_TIME, PROPR_RATING_HEIGHT, PROPR_VIEW_RATING, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM, PROPR_RATING_LIKE_COLOR, PROPR_RATING_DISLIKE_COLOR */
  //TODO: improve perf by caching elements
  var my = {
    /**
     * @description Object with all elements
     */
    cachedEls: {},
    /**
     * @description Retrieve background page
     */
    getBackgroundPage: function () {
      var bgPage = null;
      if (chrome && chrome.extension && chrome.extension.getBackgroundPage) {
        bgPage = chrome.extension.getBackgroundPage();
      }
      return bgPage;
    },
    /**
     * @description Update settings
     * @param {String} proprName
     * @param {Object} proprVal
     */
    updatePropr: function (proprName, proprVal) {
      var settingsUpdated = {},
        customEvent,
        bgWindow;
      bgWindow = my.getBackgroundPage();
      if (bgWindow) {
        settingsUpdated[proprName] = proprVal;
        customEvent = new CustomEvent("setPropr", {
          detail: {
            sentFrom: "YtOptions",
            settings: settingsUpdated
          }
        });
        bgWindow.dispatchEvent(customEvent);
      }
    },
    /**
     * @description Update time value
     * @param {Number} val
     */
    updateTimeValue: function (val) {
      var rangeValueEl = document.getElementById("imageTimeValue");
      rangeValueEl.textContent = val;
    },
    /**
     * @description Function executed when rotate time is changed
     */
    onChangeRotateTime: function () {
      var initTime;
      initTime = parseInt(this.value, 10);
      my.updateTimeValue(initTime);
      my.updatePropr(PROPR_IMAGE_TIME, initTime);
    },
    /**
     * @description Setup input range for time
     * @param {Number} defaultVal
     */
    setupRotateSpeed: function (defaultVal) {
      var inputRangeAttr;
      inputRangeAttr = {
        "min": 0,
        "max": 5000,
        "step": 100
      };
      DyDomHelper.setAttr(my.cachedEls[PROPR_IMAGE_TIME], inputRangeAttr);
      my.cachedEls[PROPR_IMAGE_TIME].value = defaultVal;
      my.cachedEls[PROPR_IMAGE_TIME].addEventListener("change", my.onChangeRotateTime, false);
      my.updateTimeValue(defaultVal);
    },
    /**
     * @description Update rating height value
     * @param {Number} val
     */
    updateRatingHeightValue: function (val) {
      var rangeValueEl = document.getElementById("ratingHeightValue");
      rangeValueEl.textContent = val;
    },
    /**
     * @description Function executed when rating height is changed
     */
    onChangeRatingHeight: function () {
      var newVal;
      newVal = parseInt(this.value, 10);
      my.updateRatingHeightValue(newVal);
      my.updatePropr(PROPR_RATING_HEIGHT, newVal);
    },
    /**
     * @description Setup input range for rating height
     * @param {Number} defaultVal
     */
    setupRatingHeight: function (defaultVal) {
      var inputRangeEl,
        inputRangeAttr;
      inputRangeEl = document.getElementById("ratingHeight");
      inputRangeAttr = {
        "min": 3,
        "max": 7,
        "step": 1
      };
      DyDomHelper.setAttr(inputRangeEl, inputRangeAttr);
      inputRangeEl.value = defaultVal;
      inputRangeEl.addEventListener("change", my.onChangeRatingHeight, false);
      my.updateRatingHeightValue(defaultVal);
    },
    /**
     *
     * @description Function executed when view rating is changed
     */
    onChangeViewRating: function () {
      my.updatePropr(PROPR_VIEW_RATING, this.value);
    },
    /**
     *
     * @description Setup select view rating
     * @param {Boolean} defaultVal
     */
    setupViewRating: function (defaultVal) {
      my.cachedEls[PROPR_VIEW_RATING].value = defaultVal.toString();
      my.cachedEls[PROPR_VIEW_RATING].addEventListener("change", my.onChangeViewRating, false);
    },
    /**
     *
     * @description Function executed when updateShowIcon event is triggered
     * @param {CustomEvent} evt
     */
    updateShowIcon: function (evt) {
      my.cachedEls[PROPR_SHOW_ICON].value = evt.detail.newValue.toString();
    },
    /**
     *
     * @description Function executed when show icon flag is changed
     */
    onChangeShowIcon: function () {
      my.updatePropr(PROPR_SHOW_ICON, this.value);
    },
    /**
     *
     * @description Setup select for show icon flag
     * @param {Boolean} defaultVal
     */
    setupShowIcon: function (defaultVal) {
      my.cachedEls[PROPR_SHOW_ICON].value = defaultVal.toString();
      my.cachedEls[PROPR_SHOW_ICON].addEventListener("change", my.onChangeShowIcon, false);
    },

    /**
     * @description Function executed when updateHideIconConfirm event is triggered
     * @param {CustomEvent} evt
     */
    updateHideIconConfirm: function (evt) {
      my.cachedEls[PROPR_HIDE_ICON_CONFIRM].value = evt.detail.newValue.toString();
    },
    /**
     *
     * @description Function executed when show icon flag is changed
     */
    onChangeHideIconConfirm: function () {
      my.updatePropr(PROPR_HIDE_ICON_CONFIRM, this.value);
    },
    /**
     * @description Setup select for ask before hiding icon flag
     * @param {Boolean} defaultVal
     */
    setupHideIconConfirm: function (defaultVal) {
      my.cachedEls[PROPR_HIDE_ICON_CONFIRM].value = defaultVal.toString();
      my.cachedEls[PROPR_HIDE_ICON_CONFIRM].addEventListener("change", my.onChangeHideIconConfirm, false);
    },

    /**
     * @description Update color list for rating like
     * @param {String} selectedColor
     */
    updateLikeColorsList: function (selectedColor) {
      const colorsList = [vpDefaults.RATING_LIKE_COLOR, '#559900'];
      let colorListHtml = '';
      colorsList.forEach((color) => {
        colorListHtml = `${colorListHtml}<option value="${color}">`;
      });
      my.cachedEls[PROPR_RATING_LIKE_COLOR_LIST].innerHTML = colorListHtml;
    },
    /**
     *
     * @description Function executed when rating like color is changed
     */
    onChangeRatingLikeColor: function () {
      my.updatePropr(PROPR_RATING_LIKE_COLOR, this.value);
      my.updateLikeColorsList(this.value);
    },
    /**
     * @description Setup for rating like color
     * @param {String} defaultVal
     */
    setupRatingLikeColor: function (defaultVal) {
      my.cachedEls[PROPR_RATING_LIKE_COLOR].value = defaultVal;
      my.cachedEls[PROPR_RATING_LIKE_COLOR].addEventListener("change", my.onChangeRatingLikeColor, false);
      my.updateLikeColorsList(this.value);
    },

    /**
     * @description Update color list for rating dislike
     * @param {String} selectedColor
     */
    updateDislikeColorsList: function (selectedColor) {
      const colorsList = [vpDefaults.RATING_DISLIKE_COLOR, '#FF0000'];
      let colorListHtml = '';
      colorsList.forEach((color) => {
        colorListHtml = `${colorListHtml}<option value="${color}">`;
      });
      my.cachedEls[PROPR_RATING_DISLIKE_COLOR_LIST].innerHTML = colorListHtml;
    },
    /**
     *
     * @description Function executed when rating dislike color is changed
     */
    onChangeRatingDislikeColor: function () {
      my.updatePropr(PROPR_RATING_DISLIKE_COLOR, this.value);
      my.updateDislikeColorsList(this.value);
    },
    /**
     * @description Setup for rating dislike color
     * @param {String} defaultVal
     */
    setupRatingDislikeColor: function (defaultVal) {
      my.cachedEls[PROPR_RATING_DISLIKE_COLOR].value = defaultVal;
      my.cachedEls[PROPR_RATING_DISLIKE_COLOR].addEventListener("change", my.onChangeRatingDislikeColor, false);
      // list with dislike colors
      my.updateDislikeColorsList(defaultVal);
    },

    /**
     *
     * @description Attach events
     */
    delegate: function () {
      window.addEventListener("updateShowIcon", my.updateShowIcon, false);
      window.addEventListener("updateHideIconConfirm", my.updateHideIconConfirm, false);
      window.addEventListener("initOptionsPage", my.initCb, false);
    },
    /**
     * @description Callback function, called when settings are retrieved
     * @param {CustomEvent} evt
     */
    initCb: function (evt) {
      var settings;
      settings = evt.detail.newValue;
      my.setupRotateSpeed(settings[PROPR_IMAGE_TIME]);
      my.setupRatingHeight(settings[PROPR_RATING_HEIGHT]);
      my.setupViewRating(settings[PROPR_VIEW_RATING]);
      my.setupShowIcon(settings[PROPR_SHOW_ICON]);
      my.setupHideIconConfirm(settings[PROPR_HIDE_ICON_CONFIRM]);
      my.setupRatingLikeColor(settings[PROPR_RATING_LIKE_COLOR]);
      my.setupRatingDislikeColor(settings[PROPR_RATING_DISLIKE_COLOR]);
    },
    /**
     *
     * @description Initialize options for site
     */
    init: function () {
      var customEvent,
        bgWindow;
      //cache elements
      my.cachedEls[PROPR_IMAGE_TIME] = document.getElementById("imageTime");
      my.cachedEls[PROPR_VIEW_RATING] = document.getElementById("enableRatingView");
      my.cachedEls[PROPR_SHOW_ICON] = document.getElementById("showIconFlag");
      my.cachedEls[PROPR_HIDE_ICON_CONFIRM] = document.getElementById("hideIconConfirmFlag");
      my.cachedEls[PROPR_RATING_LIKE_COLOR] = document.getElementById("ratingLikeColor");
      my.cachedEls[PROPR_RATING_LIKE_COLOR_LIST] = document.getElementById("ratingLikeColorList");
      my.cachedEls[PROPR_RATING_DISLIKE_COLOR] = document.getElementById("ratingDislikeColor");
      my.cachedEls[PROPR_RATING_DISLIKE_COLOR_LIST] = document.getElementById("ratingDislikeColorList");
      //Listen for the messages
      my.delegate();
      bgWindow = my.getBackgroundPage();
      if (bgWindow) {
        customEvent = new CustomEvent("getPropr", {
          detail: {
            returnOn: "YtOptions",
            prop: "all"
          }
        });
        bgWindow.dispatchEvent(customEvent);
      }
    }
  };
  my.init();
}());