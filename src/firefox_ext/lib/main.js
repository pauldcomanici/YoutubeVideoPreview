/**
 * @description Extension background logic
 */
/*jslint browser: true, devel: true */
var YtpBackground = (function () {
    "use strict";
    /*global require*/
    var my,
        publicMethods,
        settingsPanel;
    my = {
        /**
         * @description Modules used by extension
         */
        mods: {
            "page": (function () {
                return require("page-mod");
            }()),
            "self": (function () {
                return require("self");
            }()),
            "panel": (function () {
                return require("panel");
            }()),
            "storage": (function () {
                return require("simple-storage");
            }()),
            "prefs": (function () {
                return require("simple-prefs");
            }())
        },
        /**
         * @description Attach events
         */
        delegate: function attachEvents() {
        },
        /**
         * @description Worker for page module
         */
        pageModWorker: function pageModWorker(worker) {
            worker.on('message', function (request) {
                var reqMsg,
                    reqCb,
                    responseObj;
                if (request) {
                    if (typeof request === "string") {
                        reqMsg = request;
                        if (reqMsg === "getSettings") {
                            responseObj = {
                                "message": "setSettings",
                                "response": {
                                    "settings": {
                                        "imageTime": 700,
                                        "viewRatingEnabled": true
                                    }
                                }
                            };
                            worker.postMessage(responseObj);
                        } else if (reqMsg === "getStyle") {
                            responseObj = {
                                "message": "setStyle",
                                "response": {
                                    "file": my.mods.self.data.url("ytvpStyle.css")
                                }
                            };
                            worker.postMessage(responseObj);
                        }
                    }
                }
            });
        },
        /**
         * @description Activate pageMod
         */
        setPageMod: function () {
            var data;
            data = my.mods.self.data;
            my.mods.page.PageMod({
                include: "*.youtube.com",
                /*contentStyleFile: data.url("ytvpStyle.css"),*/
                contentScriptFile: [data.url("ytConst.js"), data.url("dyDomHelper.js"), data.url("ytVideoPreview.js")],
                contentScriptWhen: "ready",
                onAttach: my.pageModWorker
            });
        },
        /**
         * @description Activate settings panel
         */
        setSettingsPanel: function () {
            settingsPanel = my.mods.panel.Panel({
                width: 300,
                height: 200,
                contentURL: my.mods.self.data.url("settings.html")
            });
        },
        /**
         * @description Activate preferences
         */
        setPreferences: function () {
            my.mods.prefs.on("ytvpSettings", function () { settingsPanel.show(); });
        },
        /**
         * @description Initialize extension
         */
        init: function () {
            my.delegate();
            my.setPageMod();
            my.setSettingsPanel();
            my.setPreferences();
        }
    };
    my.init();
    //public methods
    publicMethods = {
        mods: my.mods
    };
    return publicMethods;
}());