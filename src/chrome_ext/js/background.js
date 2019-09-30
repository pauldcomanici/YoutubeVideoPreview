/**
 *
 * @description Logic for background page
 *              all extension calls are coming from background page
 *              and they are sent from background page
 */
(function () {
  "use strict";
  /*global chrome, window, setTimeout, CustomEvent, YtSettings, PROPR_IMAGE_TIME, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM, PROPR_VIEW_RATING */
  var my;
  my = {
    /**
     *
     * @description Run content script on provided tab
     * @param {Number} tabId
     */
    runContentScript: function (tabId) {
      var contentScripts = chrome.app.getDetails().content_scripts,
        contentScriptsLength,
        i;
      if (contentScripts && contentScripts[0] && contentScripts[0].js) {
        contentScripts = contentScripts[0].js;
        contentScriptsLength = contentScripts.length;
        for (i = 0; i < contentScriptsLength; i = i + 1) {
          chrome.tabs.executeScript(tabId, {file: contentScripts[i]});
        }
      }
    },
    /**
     *
     * @description Toggle extension icon from location
     * @param {Boolean} isVisible
     * @param {Number} tabId
     */
    toggleIcon: function (isVisible, tabId) {
      isVisible = isVisible || false;
      if (isVisible) {
        chrome.pageAction.show(tabId);
      } else {
        chrome.pageAction.hide(tabId);
      }
    },
    /**
     *
     * @description Function executed when extension settings changed
     *              and we need to do changes on all tabs where YouTube is open
     * @param {String} callMethod
     * @param {Array} callParams
     * @param {Boolean} runContentScript
     */
    updateAllYoutubeTabs: function (callMethod, callParams, runContentScript) {
      chrome.windows.getAll({populate: true}, function (windows) {
        var windowsLength,
          windowIndex,
          tabIndex,
          tabs,
          tabsLength,
          tabUrl;
        runContentScript = runContentScript || false;
        windowsLength = windows.length;
        for (windowIndex = 0; windowIndex < windowsLength; windowIndex = windowIndex + 1) {
          tabs = windows[windowIndex].tabs;
          tabsLength = tabs.length;
          for (tabIndex = 0; tabIndex < tabsLength; tabIndex = tabIndex + 1) {
            tabUrl = tabs[tabIndex].url;
            //test if is youTube url
            if (tabUrl.match(/https?:\/\/(w{3}\.)?youtube\.com/i)) {
              callParams.push(tabs[tabIndex].id);
              my[callMethod].apply(null, callParams);
              callParams.pop(); //remove tabId that was previously added
              if (runContentScript) {
                my.runContentScript(tabs[tabIndex].id);
              }
            }
          }
        }
      });
    },
    /**
     * @description Function executed before updateAllYoutubeTabs is called (callback function)
     * @param {Boolean} iconVisible
     */
    beforeUpdateAllYoutubeTabs: function (iconVisible) {
      my.updateAllYoutubeTabs("toggleIcon", [iconVisible], true);
    },
    /**
     *
     * @description Open options page
     */
    openOptions: function () {
      var url = chrome.extension.getURL(chrome.app.getDetails().options_page);
      chrome.tabs.getAllInWindow(null, function (tabs) {
        var i,
          tabsLength;
        tabsLength = tabs.length;
        for (i = 0; i < tabsLength; i = i + 1) {
          if (tabs[i].url === url) {
            chrome.tabs.update(tabs[i].id, {selected: true});
            return;
          }
        }
        chrome.tabs.create({selected: true, url: url});
      });
    },
    /**
     * @description Callback after icon flag was retrieved
     * @param {String} proprName
     * @param {Boolean} showIconFlag
     * @param {Number} tabId
     */
    atRetrieveIconFlag: function (proprName, showIconFlag, tabId) {
      if (showIconFlag) {
        // Show the page action
        chrome.pageAction.show(tabId);
      }
    },
    /**
     *
     * @description Called when a message is passed.
     * @param {String} request
     * @param sender
     * @param {Function} sendResponse
     */
    onRequest: function (request, sender, sendResponse) {
      let reqMsg;
      let payload;

      if (request) {
        if (typeof request === "string") {
          reqMsg = request;
        } else if (typeof request === "object") {
          reqMsg = request.type;
          payload = request.payload;
        }

        if (reqMsg === 'getVideoData') {
          const reqUrl = 'https://www.googleapis.com/youtube/v3/videos/';
          const reqData = `part=statistics&id=${payload}&key=AIzaSyAKHgX0wWr82Ko24rnJSBqs8FFvHns21a4`;
          ajax.execute('GET', reqUrl, reqData, [sender.tab.id], my.sendVideoData);
        } else if (reqMsg === "openOptions") {
          my.openOptions();
        } else if (reqMsg === "getSettings") {
          my.callOnGetSettingsPropr("all", my.messageActionPageWithSettings, [sender.tab.id]);
        } else if (reqMsg === "showAction") {
          my.callOnGetSettingsPropr(PROPR_SHOW_ICON, my.atRetrieveIconFlag, [sender.tab.id]);
        }
      }
    },

    sendVideoData: function (resp, tabId) {
      let jsonRes;
      try {
        jsonRes = JSON.parse(resp);
      } catch (e) {

      }
      if (jsonRes && jsonRes.items) {
        // send response to the tab from where data was retrieved
        chrome.tabs.sendMessage(
          tabId,
          {
            message: "setVideoData",
            response: jsonRes,
          }
        );
      }
    },
    /**
     *
     * @description Test if linkUrl is options page
     * @param {String} linkUrl
     * @returns {Boolean}
     */
    isOptionPage: function (linkUrl) {
      var onPageFlag = false,
        appDetails,
        optionsPageReg;
      appDetails = chrome.app.getDetails();
      optionsPageReg = new RegExp(chrome.extension.getURL(appDetails.options_page), "i");
      if (linkUrl.match(optionsPageReg)) {
        onPageFlag = true;
      }
      return onPageFlag;
    },
    /**
     *
     * @description Send event to options
     * @param {String} eventName
     * @param {String} newValue
     */
    messageOptionsPageForUpdate: function (eventName, newValue) {
      var customEvent,
        extensionView,
        extensionViews,
        extensionViewsLength,
        i,
        isOptionPage;
      extensionViews = chrome.extension.getViews(); //get all views
      extensionViewsLength = extensionViews.length;
      for (i = 0; i < extensionViewsLength; i = i + 1) {
        extensionView = extensionViews[i];
        isOptionPage = my.isOptionPage(extensionView.location.href);
        if (isOptionPage) {
          customEvent = new CustomEvent(eventName, {
            detail: {
              newValue: newValue
            }
          });
          extensionView.dispatchEvent(customEvent);
          break;
        }
      }
    },
    /**
     *
     * @description Send message to tabId for updating property name
     *              with newValue
     * @param {String} proprName
     * @param {String} newValue
     * @param {Number} tabId
     */
    messageActionPageForUpdate: function (proprName, newValue, tabId) {
      chrome.tabs.sendMessage(tabId, {message: "updateSettings", response: {proprName: proprName, newValue: newValue}});
    },
    /**
     *
     * @description Send message to tabId with extension settings
     * @param {String} proprName
     * @param {Object} settings
     * @param {Number} tabId
     */
    messageActionPageWithSettings: function (proprName, settings, tabId) {
      chrome.tabs.sendMessage(tabId, {message: "setSettings", response: {settings: settings}});
    },
    /**
     *
     * @description Function executed when a storage event is triggered
     * @param {Event} evt
     */
    storageHandler: function (evt) {
      var changeOn,
        newValue,
        eventForOptionsPage,
        eventForActionPage,
        isOptionPage;
      eventForActionPage = false;
      changeOn = evt.key;
      newValue = evt.newValue;
      if (changeOn === PROPR_SHOW_ICON) {
        if (newValue === "false" || newValue === false) {
          newValue = false;
        } else {
          newValue = true;
        }
        my.updateAllYoutubeTabs("toggleIcon", [newValue]);
        //my.onShowIconUpdate(newValue);
        eventForOptionsPage = "updateShowIcon";
      } else if (changeOn === PROPR_HIDE_ICON_CONFIRM) {
        eventForOptionsPage = "updateHideIconConfirm";
      } else if (changeOn === PROPR_IMAGE_TIME) {
        eventForActionPage = true;
      } else if (changeOn === PROPR_VIEW_RATING) {
        eventForActionPage = true;
      }
      if (eventForOptionsPage) {
        //now test if event was sent from options page
        if (evt.url) {
          isOptionPage = my.isOptionPage(evt.url);
        } else {
          isOptionPage = false;
        }
        if (!isOptionPage) {
          my.messageOptionsPageForUpdate(eventForOptionsPage, newValue);
        }
      }
      if (eventForActionPage) {
        my.updateAllYoutubeTabs("messageActionPageForUpdate", [changeOn, newValue]);
      }
    },
    /**
     * @description Send message back to sendOn class with setting property
     * @param {String} proprName
     * @param {Object} proprVal
     * @param {String} sendOn
     */
    sendSettingsMessageBack: function (proprName, proprVal, sendOn) {
      if (sendOn === "YtPopup") {
        chrome.extension.sendMessage({message: "setHidePageActionConfirm", propr: proprVal});
      } else if (sendOn === "YtOptions") {
        my.messageOptionsPageForUpdate("initOptionsPage", proprVal);
      }
    },
    /**
     * @description Properties getter, called from other scripts for retrieving settings
     * @param {CustomEvent} evt
     */
    proprGetter: function (evt) {
      var reqCb,
        request;
      request = evt.detail;
      if (request.returnOn) {
        reqCb = my.sendSettingsMessageBack;
      }
      my.callOnGetSettingsPropr(request.prop, reqCb, [request.returnOn]);
    },
    /**
     * @description Properties setter, called from other scripts for updating settings
     * @param {CustomEvent} evt
     */
    proprSetter: function (evt) {
      var reqCb,
        request,
        proprName;
      request = evt.detail;
      if (request.sentFrom) {
        reqCb = request.sentFrom;
      }
      for (proprName in request.settings) {
        if (request.settings.hasOwnProperty(proprName)) {
          YtSettings.setPropr(proprName, request.settings[proprName]);
        }
      }
    },
    /**
     * @description Function executed when something changes in chrom.storage.sync
     * @param {Object} changes
     */
    chromeStorageSync: function (changes) {
      var evt = {},
        changeOn;
      if (changes) {
        for (changeOn in changes) {
          if (changes.hasOwnProperty(changeOn)) {
            evt.key = changeOn;
            evt.newValue = changes[changeOn].newValue;
            evt.url = "";
            my.storageHandler(evt);
          }
        }
      }
    },
    /**
     * @description Function that makes call to get settings properties
     * @param {String} proprName
     * @param {Function} cbFn
     * @param {Array} cbArgs
     */
    callOnGetSettingsPropr: function callOnGetSettingsPropr(proprName, cbFn, cbArgs) {
      var isReady;
      isReady = YtSettings.isInit();
      if (isReady) {
        YtSettings.getPropr(proprName, cbFn, cbArgs);
      } else {
        setTimeout(function () {
          callOnGetSettingsPropr(proprName, cbFn, cbArgs);
        }, 15);
      }
    },
    /**
     * @description Attach event for storage changes
     */
    attachStorageEvent: function () {
      if (chrome.storage && chrome.storage.sync) {
        //event listener to chrome.storage.sync updates
        chrome.storage.onChanged.addListener(my.chromeStorageSync);
      } else {
        //set storage event listener
        window.addEventListener("storage", my.storageHandler, false);
      }
    },
    /**
     * @description Attach events
     */
    delegate: function () {
      my.attachStorageEvent();
      //set custom event listener for getting prop
      window.addEventListener("getPropr", my.proprGetter, false);
      //set custom event listener for setting prop
      window.addEventListener("setPropr", my.proprSetter, false);
      //set custom event listener for open options page
      window.addEventListener("openOptions", my.openOptions, false);
      //Listen for the content script to send a message to the background page.
      chrome.extension.onMessage.addListener(my.onRequest);
      //listener for extension install/update
      chrome.runtime.onInstalled.addListener(function (details) {
        my.callOnGetSettingsPropr(PROPR_SHOW_ICON, my.beforeUpdateAllYoutubeTabs);
      });
    },
    /**
     * @description Initialize background page
     */
    init: function () {
      my.delegate();
    }
  };
  my.init();
}());