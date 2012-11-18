/**
 * Youtube Preview
 */
(function () {
	"use strict";
	/*global window, document, setTimeout, DyDomHelper, XMLHttpRequest, ActiveXObject, chrome, YtProprViewRating, YtProprImageTime */
	var my,
		publicMethods;
	my = {
		defaultImg: "default",
		defaultHqImg: "hqdefault",
		defaultImgWidth: 120,
		imgExt: ".jpg",
		defaultImgPath: "http://i3.ytimg.com/vi/",
		maxTestNr: 50,
		hoverTimer: null,
		videoSelector: ".yt-thumb-clip",
		videoIdReg: "([a-z0-9-_=]+)",
		ratingAddedCssClass: "YtPreviewRating",
		knownAddedCssClass: "YtPreviewKnown",
		settings: {},
		dataParsedAttr: "data-yt-parsed",
		/**
		 * 
		 * @description Add video rating
		 * @param resp
		 * @param {HTMLElement} parentEl
		 */
		appendRating: function appendRating(resp, parentEl) {
			var positiveRatio = 0,
				negativeRatio = 0,
				ratingEl,
				ratingHeight,
				ratingHeightPx,
				likesEl,
				dislikesEl,
				likes = 0,
				ratingCount = 0,
				ratingElCss = {},
				parentElCss,
				marginBottom = 0,
				videoThumbEl,
				likesCss,
				parentElWidth = "138px",
				parentElHeight = 0,
				parentElLeft = 0,
				parentHasClassUxThumb = false;
			function isStringOrNumber(v) {
				var r = false;
				if (typeof v === "string" || typeof v === "number") {
					r = true;
				}
				return r;
			}
			try {
				resp = JSON.parse(resp);
			} catch (ex) {
				//console.log(ex.message);
			}
			if (resp && resp.data) {
				//response has data
				if (isStringOrNumber(resp.data.likeCount)) {
					likes = parseInt(resp.data.likeCount, 10);
					if (isStringOrNumber(resp.data.ratingCount)) {
						ratingCount = parseInt(resp.data.ratingCount, 10);
						positiveRatio = likes * 100 / ratingCount;
						positiveRatio = parseFloat(positiveRatio.toFixed(2));
						negativeRatio = (100 - positiveRatio).toFixed(2);
						parentElWidth = DyDomHelper.getCssProp(parentEl, "width");
						ratingHeight = 3;
						ratingHeightPx = ratingHeight + "px";
						if (DyDomHelper.hasClass(parentEl, "ux-thumb-wrap")) {
							parentHasClassUxThumb = true;
						}
						ratingElCss = {
							maxWidth: "138px",
							width: parentElWidth,
							height: ratingHeightPx,
							margin: 0,
							position: "absolute",
							bottom: 0,
							top: "auto",
							left: 0
						};
						parentElHeight = DyDomHelper.getCssProp(parentEl, "height", true) + 1;
						//ratingElCss.top = parentElHeight + "px";
						if (parentHasClassUxThumb) {
							ratingElCss.maxWidth = parentElWidth;
						}
						parentElLeft = DyDomHelper.getCssProp(parentEl, "padding-left", true);
						parentElLeft = parentElLeft + DyDomHelper.getCssProp(parentEl, "margin-left", true);
						if (parentElLeft > 0) {
							ratingElCss.left = parentElLeft + "px";
						}
						videoThumbEl = parentEl.querySelector(".ux-thumb-wrap");
						if (videoThumbEl) {
							ratingElCss.maxWidth = DyDomHelper.getCssProp(videoThumbEl, "width");
						}
						ratingEl = DyDomHelper.createEl("div",
								{"class": "video-extras-sparkbars"},
								ratingElCss);
						likesCss = {
							height: ratingHeightPx,
							width: "0%",
							background: "#590"
						};
						likesCss.width = positiveRatio + "%";
						likesEl = DyDomHelper.createEl("div",
							{
								"class": "video-extras-sparkbar-likes",
								title: likes + " likes from " + ratingCount + " rating (" + positiveRatio + "%)"
							},
							likesCss);
						likesCss.width = negativeRatio + "%";
						likesCss.background = "#f00";
						dislikesEl = DyDomHelper.createEl("div",
							{
								"class": "video-extras-sparkbar-dislikes",
								title: likes + " likes from " + ratingCount + " rating (" + negativeRatio + "%)"
							},
							likesCss);
						ratingEl.appendChild(likesEl);
						ratingEl.appendChild(dislikesEl);
						parentEl.appendChild(ratingEl);
						parentElCss = {
							position: "relative"
						};
						if (parentHasClassUxThumb) {
							parentElCss.height = (parentElHeight + ratingHeight) + "px";
						}
						DyDomHelper.setCss(parentEl, parentElCss);
					}
				}
			}
		},
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
		doAjaxRequest: function doAjaxRequest(reqMethod, reqUrl, reqData, cbParams, successFn, errorFn) {
			var xhr,
				aSync = true,
				noCache = true,
				concatString;
			cbParams = cbParams || [];
			try {
				xhr = new XMLHttpRequest(); //FireFox, Safari, Chrome, Opera ...
			} catch (e) {
				//console.log(e.message);
				try {
					xhr = new ActiveXObject('Msxml2.XMLHTTP'); //IE
				} catch (e2) {
					//console.log(e2.message);
					try {
						xhr = new ActiveXObject('Microsoft.XMLHTTP'); //IE
					} catch (e3) {
						//console.log(e3.message);
						//XMLHttpRequest not supported
					}
				}
			}
			if (xhr) {
				xhr.onreadystatechange = function () {
					if (xhr.readyState  === 4) {
						if (xhr.status  === 200) {
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
					concatString = "?";
					if (noCache === true) {
						reqUrl = reqUrl + "?_dy_no_cache__" + (new Date()).getTime();
						concatString = "&";
					}
					if (reqMethod.toUpperCase() === "GET") {
						reqUrl = reqUrl + concatString + reqData;
						reqData = null;
					}
					xhr.open(reqMethod, reqUrl, aSync);
					//xhr.setRequestHeader("Content-type", "application/json", true);
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
				//console.log("Cannot initialize XHR request");
			}
		},
		/**
		 * 
		 * @description Retrieve video data
		 * @param {String} videoId
		 * @param {HTMLElement} parentEl
		 */
		retrieveVideoData: function retrieveVideoData(videoId, parentEl) {
			var reqUrl,
				reqData;
			reqUrl = "http://gdata.youtube.com/feeds/api/videos/" + videoId;
			reqData = "v=2&prettyprint=false&alt=jsonc";
			my.doAjaxRequest("GET", reqUrl, reqData, [parentEl], my.appendRating);
		},
		/**
		 * 
		 * @description Test if rating was already applied to video
		 *              and if not then apply it
		 * @param {HTMLElement} videoEl
		 */
		testVideoForRating: function testVideoForRating(videoEl) {
			var continueTest = false,
				nodeName,
				videoId = "",
				videoLink = "",
				videoRegRez,
				videoIdRegExp = new RegExp("v=" + my.videoIdReg, "i"),
				isCase1 = false, //when it has only "related-video" or "video-list-item-link" or "related-playlist" class
				isCase2 = false, //when it has only "yt-uix-sessionlink" class and not case 1 classes
				parentEl;
			if (videoEl && DyDomHelper.hasClass(videoEl, "ux-thumb-wrap")) {
				parentEl = videoEl;
				nodeName = videoEl.nodeName;
				if (nodeName !== "A") {
					videoEl = videoEl.parentNode;
					if (DyDomHelper.hasClass(videoEl, "related-video") ||
							DyDomHelper.hasClass(videoEl, "video-list-item-link") ||
							DyDomHelper.hasClass(videoEl, "related-playlist")) {
						isCase1 = true;
					}
					if (DyDomHelper.hasClass(videoEl, "yt-uix-sessionlink") &&
							!isCase1) {
						isCase2 = true;
					}
					if (isCase1 || isCase2) {
						nodeName = videoEl.nodeName;
						if (nodeName === "A") {
							//console.log(parentEl);
							continueTest = true;
							parentEl = videoEl;
							if (isCase2) {
								parentEl = parentEl.parentNode;
							}
						}
					}
				} else {
					continueTest = true;
				}
			}
			//element is A and has desired css class
			if (continueTest) {
				if (!DyDomHelper.hasClass(parentEl, my.ratingAddedCssClass)) {
					DyDomHelper.addClass(parentEl, my.ratingAddedCssClass);
					videoLink = videoEl.getAttribute("href");
					if (videoLink && videoLink.length > 0) {
						if (videoLink.match(videoIdRegExp)) {
							videoRegRez = videoIdRegExp.exec(videoLink);
							videoId = videoRegRez[1];
							//console.log(videoId);
							my.retrieveVideoData(videoId, parentEl);
						}
					}
				}
			}
		},
		/**
		 * 
		 * @description Add rating to videos
		 */
		addRating: function addRating() {
			var videoParentEls,
				elementsNr = 0,
				i = 0,
				videoParentEl;
			videoParentEls = document.querySelectorAll(my.videoSelector);
			elementsNr = videoParentEls.length;
			for (i = 0; i < elementsNr; i = i + 1) {
				videoParentEl = videoParentEls[i].parentNode.parentNode;
				my.testVideoForRating(videoParentEl);
			}
		},
		/**
		 * 
		 * @description Switch image for video preview
		 * @param {HTMLElement} imgEl
		 */
		switchVideoImg: function switchVideoImg(imgEl) {
			var imgData,
				imgId,
				newImgPath,
				imageTop,
				setCss;
			if (my.hoverTimer !== null) {
				window.clearTimeout(my.hoverTimer);
			}
			imgData = imgEl.dataset;
			imgId = imgData.ytImg;
			imgId = parseInt(imgId, 10);
			if (isNaN(imgId)) {
				imgId = 0;
			}
			imgId = imgId + 1;
			if (imgId > 3) {
				imgId = 1;
			}
			if (imgData.ytId) {
				setCss = {"width": my.defaultImgWidth + "px"};
				imageTop = DyDomHelper.getCssProp(imgEl, "top", true);
				if (imageTop < -12) {
					setCss.top = 0;
				}
				newImgPath = my.defaultImgPath + imgData.ytId + "/" + imgId + my.imgExt;
				imgEl.setAttribute("src", newImgPath);
				DyDomHelper.setCss(imgEl, setCss);
			}
			imgEl.dataset.ytImg = imgId;
			my.hoverTimer = setTimeout(function () { my.switchVideoImg(imgEl); }, my.settings[YtProprImageTime]);
		},
		/**
		 * 
		 * @description Set default image
		 * @param {HTMLElement} imgEl
		 */
		setDefaultImg: function setDefaultImg(imgEl) {
			var imgData = imgEl.dataset,
				newImgPath = "";
			newImgPath = my.defaultImgPath + imgData.ytId + "/" + imgData.ytDefaultImg + my.imgExt;
			imgEl.setAttribute("src", newImgPath);
			DyDomHelper.setCss(imgEl, {"width": imgData.ytImgWidth, "top": ""});
			imgEl.dataset.ytImg = 0;
			window.clearTimeout(my.hoverTimer);
			my.hoverTimer = null;
		},
		/**
		 * 
		 * @description Test if image element is for a video
		 * @param {HTMLElement} videoImgEl
		 * @param {String} actType
		 */
		testVideoImg: function testVideoImg(videoImgEl, actType) {
			var testNr = 0,
				initImgRegExp,
				rezReg,
				initImg,
				useDefaultImage = my.defaultImg,
				useWidth = my.defaultImgWidth,
				regMatch;
			testNr = videoImgEl.dataset.ytTestNr;
			if (testNr === undefined) {
				testNr = 0;
			} else {
				testNr = parseInt(testNr, 10);
				if (isNaN(testNr)) {
					testNr = 0;
				}
			}
			testNr = testNr + 1;
			if (my.maxTestNr > testNr) {
				videoImgEl.dataset.ytTestNr = testNr;
				regMatch = false;
				initImgRegExp = new RegExp("\\/" + my.videoIdReg + "\\/([a-z]*)(default)\\.", "i");
				initImg = videoImgEl.getAttribute("src");
				if (initImg.match(initImgRegExp)) {
					regMatch = true;
				} else {
					initImg = videoImgEl.dataset.thumb;
					if (initImg && initImg.match(initImgRegExp)) {
						regMatch = true;
					}
				}
				if (regMatch) {
					rezReg = initImgRegExp.exec(initImg);
					if (rezReg.length === 4) {
						useDefaultImage = rezReg[2] + rezReg[3];
						useWidth = DyDomHelper.getCssProp(videoImgEl, "width");
						videoImgEl.dataset.ytId = rezReg[1];
						//console.log(videoImgEl.dataset.ytId);
						videoImgEl.dataset.ytImg = 0;
						videoImgEl.dataset.ytDefaultImg = useDefaultImage;
						videoImgEl.dataset.ytImgWidth = useWidth;
						videoImgEl.dataset.ytParsed = true;
						my.initVideoSettings("in", videoImgEl);
					}
				} else {
					//console.log("no match at reg for: "+initImg+" , testNr: "+testNr);
					setTimeout(function () { testVideoImg(videoImgEl, actType); }, 100);
				}
			} else if (my.maxTestNr >= testNr) {
				videoImgEl.dataset.ytTestNr = testNr + 1;
			}
		},
		/**
		 * 
		 * @description Initialize video settings
		 * @param {String} actType
		 * @param {HTMLElement} videoImgEl
		 */
		initVideoSettings: function initVideoSettings(actType, videoImgEl) {
			var settingsParsed = videoImgEl.getAttribute(my.dataParsedAttr);
			if (settingsParsed && settingsParsed === "true") {
				settingsParsed = true;
			} else {
				settingsParsed = false;
			}
			videoImgEl.setAttribute(my.dataParsedAttr, settingsParsed);
			//console.log(settingsParsed);
			if (settingsParsed === true) {
				if (actType === "in") {
					my.switchVideoImg(videoImgEl);
				} else {
					my.setDefaultImg(videoImgEl);
				}
			} else {
				my.testVideoImg(videoImgEl, actType);
			}
		},
		/**
		 * 
		 * @description Function executed when user enters video element
		 */
		mouseEnterVideo: function () {
			var videoImgEl,
				videoParentEl;
			//console.log('hover in');
			videoImgEl = this.querySelector("img");
			my.initVideoSettings("in", videoImgEl);
			if (my.settings[YtProprViewRating]) {
				videoParentEl = this.parentNode.parentNode;
				my.testVideoForRating(videoParentEl);
			}
		},
		/**
		 * 
		 * @description Function executed when user exits video element
		 */
		mouseExitVideo: function () {
			var videoImgEl = this.querySelector("img");
			//console.log('hover out');
			my.initVideoSettings("out", videoImgEl);
		},
		/**
		 * 
		 * @description Attach mouse event for video
		 * @param eventOnEl
		 */
		delegateMouseEvt: function delegateMouseEvt(eventOnEl) {
			var videoEls,
				videoElsMaxIndex,
				videoEl,
				videoParentEl,
				i,
				wasParsed;
			if (!eventOnEl) {
				eventOnEl = document.getElementById("body-container");
				if (!eventOnEl) {
					eventOnEl = document;
				}
			}
			videoEls = eventOnEl.querySelectorAll(my.videoSelector);
			videoElsMaxIndex = videoEls.length - 1;
			for (i = videoElsMaxIndex; i >= 0; i = i - 1) {
				videoEl = videoEls[i];
				wasParsed = DyDomHelper.hasClass(videoEl, my.knownAddedCssClass);
				if (!wasParsed) {
					DyDomHelper.addClass(videoEl, my.knownAddedCssClass);
					videoEl.addEventListener("mouseover", my.mouseEnterVideo, false);
					videoEl.addEventListener("mouseout", my.mouseExitVideo, false);
					if (my.settings[YtProprViewRating]) {
						videoParentEl = videoEl.parentNode.parentNode;
						my.testVideoForRating(videoParentEl);
					}
				}
			}
		},
		testForNewVideo: function testForNewVideo(evt) {
			var nodeName,
				el,
				continueLogic = true;
			el = evt.target;
			if (el) {
				nodeName = el.nodeName.toLowerCase();
				if (nodeName === "#comment" || nodeName === "#text" || nodeName === "script" ||
						nodeName === "style" || nodeName === "link" || nodeName === "input" ||
						nodeName === "iframe") {
					continueLogic = false;
				}
				if (continueLogic) {
					//console.log(nodeName);
					my.delegateMouseEvt(el);
				}
			}
		},
		/**
		 * 
		 * @description Attach events for page
		 */
		delegateForPage: function delegateForPage() {
			document.addEventListener("DOMNodeInserted", my.testForNewVideo, true);
			my.delegateMouseEvt();
		},
		/**
		 * 
		 * @description Parse response at get settings
		 * @param {Object} response
		 */
		parseResponseAtGetSettings: function parseResponseAtGetSettings(response) {
			//console.log(response);
			if (typeof response === "object") {
				if (response.settings) {
					my.init(response.settings);
				}
			}
		},
		/**
		 * 
		 * @description Called when a message is passed.
		 * @param {Object} request
		 * @param sender
		 * @param {Function} sendResponse
		 */
		onRequest: function onRequest(request, sender, sendResponse) {
			var proprName,
				newValue;
			if (typeof request === "object") {
				newValue = request.newValue;
				proprName = request.proprName;
				if (proprName === YtProprViewRating) {
					if (newValue === false || newValue === "false") {
						newValue = false;
					} else {
						newValue = true;
					}
				} else if (proprName === YtProprImageTime) {
					newValue = parseInt(newValue, 10);
				}
				my.settings[proprName] = newValue;
			}
			//sendResponse({});
		},
		/**
		 * 
		 * @description Attach events for extension
		 */
		delegateForExtension: function delegateForExtension() {
			if (chrome && chrome.extension) {
				chrome.extension.sendMessage("showAction", function (response) {});
				chrome.extension.sendMessage("getSettings", my.parseResponseAtGetSettings);
				chrome.extension.onMessage.addListener(my.onRequest);
			}
		},
		/**
		 * 
		 * @description Initialize youtube video preview for page
		 * @param {Object} settings
		 */
		init: function init(settings) {
			my.settings = settings;
			my.delegateForPage();
		}
	};
	my.delegateForExtension();
	//public
//	publicMethods = {
//		init: my.init,
//		appendRating: my.appendRating
//	};
	//return publicMethods;
}());
