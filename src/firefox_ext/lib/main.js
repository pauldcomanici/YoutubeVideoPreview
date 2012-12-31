var YtpBackground = (function () {
	var my,
		publicMethods;
	my = {
		mods: {
			"page": (function () {
				return require("page-mod");
			}()),
			"self": (function () {
				return require("self");
			}())
		},
		delegate: function attachEvents() {
		},
		pageModWorker: function pageModWorker(worker) {
			worker.on('message', function(request) {
				var reqMsg,
					reqCb;
				if (request) {
					if (typeof request === "string") {
						reqMsg = request;
						if (reqMsg === "getSettings") {
							var s = {
								"message": "setSettings",
								"response": {
									"settings": {
										"imageTime": 700,
										"viewRatingEnabled": true
									}
								}
							};
							worker.postMessage(s);
						}
					}
				}
			});
		},
		setPageMod: function () {
			var data;
			data = my.mods.self.data;
			my.mods.page.PageMod({
				include: "*.youtube.com",
				contentScriptFile: [data.url("ytConst.js"), data.url("dyDomHelper.js"), data.url("ytVideoPreview.js")],
				contentScriptWhen: "ready",
				onAttach: my.pageModWorker
			});
		},
		init: function () {
			my.delegate();
			my.setPageMod();
		}
	};
	my.init();
	publicMethods = {
		mods: my.mods
	};
	return publicMethods;
}());