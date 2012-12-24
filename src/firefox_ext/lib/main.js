var tabs = require("tabs");

function logURL(tab) {
  console.log(tab.url);
}

var pageMod = require("page-mod");
var selfMod = require("self");
var data = selfMod.data;

function pageModWorker(worker) {
	worker.on('message', function(request) {
		var reqMsg,
			reqCb;
		if (request) {
			if (typeof request === "string") {
				reqMsg = request;
				if (reqMsg === "openOptions") {
					//my.openOptions();
				} else if (reqMsg === "getSettings") {
					console.log("getSettings");
					var s = {
						"message": "setSettings",
						"response": {
							"settings": {
								"imageTime": 1000,
								"viewRatingEnabled": true
							}
						}
					};
					worker.postMessage(s);
				} else if (reqMsg === "showAction") {
					//my.callOnGetSettingsPropr(PROPR_SHOW_ICON, my.atRetrieveIconFlag, [sender.tab.id]);
				}
			}
		}
	});
}

pageMod.PageMod({
	include: "*.youtube.com",
	contentScriptFile: [data.url("ytConst.js"), data.url("dyDomHelper.js"), data.url("ytVideoPreview.js")],
	contentScriptWhen: "ready",
	onAttach: pageModWorker
});