/**
 *
 * @description Logic for popup page
 */
(function () {
  "use strict";
  /*global window, document, chrome, CustomEvent, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM */
  var my = {
    hidePageActionConfirm: false,
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
     *
     * @description Executed when user clicks option
     */
    optionsClick: function () {
      var bgWindow,
        customEvent;
      bgWindow = my.getBackgroundPage();
      if (bgWindow) {
        customEvent = new CustomEvent("openOptions", {
          detail: {
            sentFrom: "YtPopup"
          }
        });
        bgWindow.dispatchEvent(customEvent);
      }
    },
    /**
     *
     * @description Executed when user clicks hide icon
     */
    hidePopupClick: function () {
      var popupMainEl,
        hideIconContainerEl;
      if (my.hidePageActionConfirm) {
        //user didn't checked "Do not ask next time"
        popupMainEl = document.getElementById("popupMain");
        popupMainEl.setAttribute("hidden", true);
        hideIconContainerEl = document.getElementById("removePageAction");
        hideIconContainerEl.removeAttribute("hidden");
      } else {
        //user checked "Do not ask next time"
        my.hidePopupYesClick();
      }
    },
    /**
     *
     * @description Executed when user clicks Yes button
     */
    hidePopupYesClick: function () {
      var settingsUpdated = {},
        customEvent,
        bgWindow;
      bgWindow = my.getBackgroundPage();
      if (bgWindow) {
        settingsUpdated[PROPR_SHOW_ICON] = false;
        settingsUpdated[PROPR_HIDE_ICON_CONFIRM] = my.hidePageActionConfirm;
        customEvent = new CustomEvent("setPropr", {
          detail: {
            sentFrom: "YtPopup",
            settings: settingsUpdated
          }
        });
        bgWindow.dispatchEvent(customEvent);
      }
      window.close();
    },
    /**
     *
     * @description Executed when user clicks No button
     */
    hidePopupNoClick: function () {
      window.close();
    },
    /**
     *
     * @description Executed when user clicks No button
     */
    hideIconConfirmClick: function () {
      my.hidePageActionConfirm = !my.hidePageActionConfirm;
    },
    /**
     *
     * @description Attach events
     */
    delegate: function () {
      var optionsEl,
        hideIconEl,
        hideIconYesEl,
        hideIconNoEl,
        hideIconConfirmEl;
      optionsEl = document.getElementById("ytPreviewOptions");
      optionsEl.addEventListener("click", my.optionsClick, false);
      hideIconEl = document.getElementById("ytPreviewHideIcon");
      hideIconEl.addEventListener("click", my.hidePopupClick, false);
      hideIconYesEl = document.getElementById("hideIconOptionsYes");
      hideIconYesEl.addEventListener("click", my.hidePopupYesClick, false);
      hideIconNoEl = document.getElementById("hideIconOptionsNo");
      hideIconNoEl.addEventListener("click", my.hidePopupNoClick, false);
      hideIconConfirmEl = document.getElementById("hideIconConfirmCheckbox");
      hideIconConfirmEl.addEventListener("click", my.hideIconConfirmClick, false);
    },
    /**
     *
     * @description Callback executed when hidePageActionConfirm is retrieved
     * @param hidePageActionConfirm
     */
    atGetHidePageActionConfirm: function (hidePageActionConfirm) {
      var hideIconConfirmEl;
      document.getElementById("loading").setAttribute("hidden", true);
      document.getElementById("popupMain").removeAttribute("hidden");
      my.hidePageActionConfirm = hidePageActionConfirm;
      hideIconConfirmEl = document.getElementById("hideIconConfirmCheckbox");
      if (!my.hidePageActionConfirm) {
        hideIconConfirmEl.setAttribute("checked", true);
      }
      my.delegate();
    },
    /**
     * @description Listener to messages
     * @param request
     */
    onRequest: function (request) {
      if (request && typeof request === "object") {
        if (request.message === "setHidePageActionConfirm") {
          my.atGetHidePageActionConfirm(request.propr);
        }
      }
    },
    /**
     *
     * @description Initialize
     */
    init: function () {
      var customEvent,
        bgWindow;
      //Listen for the messages
      chrome.extension.onMessage.addListener(my.onRequest);
      customEvent = new CustomEvent("getPropr", {
        detail: {
          returnOn: "YtPopup",
          prop: PROPR_HIDE_ICON_CONFIRM
        }
      });
      bgWindow = my.getBackgroundPage();
      bgWindow.dispatchEvent(customEvent);
    }
  };
  my.init();
}());