/**
 * Youtube Preview
 */
(function () {
    "use strict";
    /*global window, document, setTimeout, DyDomHelper, XMLHttpRequest, ActiveXObject, chrome, self, PROPR_VIEW_RATING, PROPR_IMAGE_TIME */
    var my;
    my = {
        defaultImg: "default", //default image name
        defaultImgWidth: 120, //default image with
        imgExt: ".jpg", //default image extension
        defaultImgPath: "http://i3.ytimg.com/vi/", //default image path
        maxTestNr: 5, //maximum number of test to be executed on element
        hoverTimer: null, //timer when hovering image
        hoverVideoId: "", //video id of hovering image
        videoSelector: "video-thumb", //".yt-thumb-clip",
        videoIdReg: "([a-z0-9-_=]+)", //regular expression for video id
        ratingAddedCssClass: "YtPreviewRating", //css class added to ....
        knownAddedCssClass: "YtPreviewKnown", //css class added to , only if element was already parsed
        validVideoCssClass: "YtPreviewValid", //css class added on img element, only for videos for thumbnail preview
        settings: {}, //settings object for extension
        datasetPrefix: "ytp", //prefix used for dataset
        /**
         * @description Get dataset property name based on property
         * @param {String} propr
         */
        getDatasetPropr: function getDatasetPropr(propr) {
            var proprName;
            //propr = propr.charAt(0).toUpperCase() + propr.substr(1, propr.length);
            proprName = my.datasetPrefix + propr;
            return proprName;
        },
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
         * @description Set default image
         * @param {HTMLElement} imgEl
         */
        setDefaultImg: function setDefaultImg(imgEl, videoId) {
            var imgData = imgEl.dataset,
                newImgPath = "";
            newImgPath = my.defaultImgPath + videoId + "/" + imgData[my.getDatasetPropr("ImgDefault")] + my.imgExt;
            imgEl.setAttribute("src", newImgPath);
            DyDomHelper.setCss(imgEl, {"width": imgData[my.getDatasetPropr("ImgWidth")], "top": ""});
            imgEl.dataset[my.getDatasetPropr("ImgIndex")] = 0;
            window.clearTimeout(my.hoverTimer);
        },
        /**
         * 
         * @description Switch image for video preview
         * @param {HTMLElement} imgEl
         */
        switchVideoImg: function switchVideoImg(imgEl, videoId) {
            var imgData,
                imgId,
                newImgPath,
                imageWidth,
                imageTop,
                setCss,
                updateCss = false;
            if (my.hoverTimer !== null) {
                window.clearTimeout(my.hoverTimer);
            }
            if (my.hoverVideoId !== videoId) {
                if (my.hoverVideoId === "") {
                    //this means that rotate image was in loop
                    my.setDefaultImg(imgEl, videoId);
                } else {
                    videoId = my.hoverVideoId;
                }
            }
            imgData = imgEl.dataset;
            imgId = imgData[my.getDatasetPropr("ImgIndex")];
            imgId = parseInt(imgId, 10);
            if (isNaN(imgId)) {
                imgId = 0;
            }
            imgId = imgId + 1;
            if (imgId > 3) {
                imgId = 1;
            }
            if (videoId) {
                imageWidth = DyDomHelper.getCssProp(imgEl, "width", true);
                if (imageWidth !== my.defaultImgWidth) {
                    setCss = {"width": my.defaultImgWidth + "px"};
                    updateCss = true;
                }
                imageTop = DyDomHelper.getCssProp(imgEl, "top", true);
                if (imageTop < -12) {
                    if (updateCss) {
                        setCss.top = 0;
                    } else {
                        setCss = {"top": 0};
                    }
                    updateCss = true;
                }
                newImgPath = my.defaultImgPath + videoId + "/" + imgId + my.imgExt;
                imgEl.setAttribute("src", newImgPath);
                if (updateCss) {
                    DyDomHelper.setCss(imgEl, setCss);
                }
            }
            imgEl.dataset[my.getDatasetPropr("ImgIndex")] = imgId;
            my.hoverTimer = setTimeout(my.switchVideoImg, my.settings[PROPR_IMAGE_TIME], imgEl, videoId);
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
                regMatch,
                videoId;
            testNr = videoImgEl.dataset[my.getDatasetPropr("TestNr")];
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
                videoImgEl.dataset[my.getDatasetPropr("TestNr")] = testNr;
                regMatch = false;
                initImgRegExp = new RegExp("vi\\/" + my.videoIdReg + "\\/([a-z]*)(default)\\.", "i");
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
                        videoId = rezReg[1];
                        useWidth = DyDomHelper.getCssProp(videoImgEl, "width");
                        videoImgEl.dataset[my.getDatasetPropr("VideoId")] = videoId;
                        videoImgEl.dataset[my.getDatasetPropr("ImgIndex")] = 0;
                        videoImgEl.dataset[my.getDatasetPropr("ImgDefault")] = useDefaultImage;
                        videoImgEl.dataset[my.getDatasetPropr("ImgWidth")] = useWidth;
                        videoImgEl.dataset[my.getDatasetPropr("Parsed")] = true;
                        if (videoId !== "undefined") {
                            my.initVideoSettings("in", videoImgEl);
                        }
                    }
                } else {
                    //console.log("no match at reg for: "+initImg+" , testNr: "+testNr);
                    setTimeout(my.testVideoImg, 100, videoImgEl, actType);
                }
            } else if (my.maxTestNr >= testNr) {
                videoImgEl.dataset[my.getDatasetPropr("TestNr")] = testNr + 1;
            }
        },
        /**
         * 
         * @description Initialize video settings
         * @param {String} actType
         * @param {HTMLElement} videoImgEl
         */
        initVideoSettings: function initVideoSettings(actType, videoImgEl) {
            var imgData,
                settingsParsed,
                parsedAttr,
                videoId;
            imgData = videoImgEl.dataset;
            parsedAttr = my.getDatasetPropr("Parsed");
            settingsParsed = imgData[parsedAttr];
            if (settingsParsed && (settingsParsed === "true" || settingsParsed === true)) {
                settingsParsed = true;
            } else {
                settingsParsed = false;
            }
            imgData[parsedAttr] = settingsParsed;
            //console.log(settingsParsed);
            if (settingsParsed === true) {
                videoId = imgData[my.getDatasetPropr("VideoId")];
                if (actType === "in") {
                    if (my.hoverVideoId !== videoId) {
                        //we switched to another video images
                        my.hoverVideoId = videoId;
                        my.switchVideoImg(videoImgEl, videoId);
                    }
                } else {
                    my.setDefaultImg(videoImgEl, videoId);
                    my.hoverVideoId = "";
                }
            } else {
                my.testVideoImg(videoImgEl, actType);
            }
        },
        /**
         * 
         * @description Function executed when user enters video element
         * @param {Event} evt
         */
        mouseEnterVideo: function mouseEnterVideo(evt) {
            var videoImgEl,
                videoParentEl;
            //console.log('hover in');
            videoImgEl = this.querySelector("img");
            my.initVideoSettings("in", videoImgEl);
            if (my.settings[PROPR_VIEW_RATING]) {
                videoParentEl = this.parentNode.parentNode;
                my.testVideoForRating(videoParentEl);
            }
            evt.stopPropagation();
        },
        /**
         * 
         * @description Function executed when user exits video element
         * @param {Event} evt
         */
        mouseExitVideo: function mouseExitVideo(evt) {
            var videoImgEl = this.querySelector("img"),
                targetEl;
            //console.log('hover out');
            targetEl = evt.toElement || evt.relatedTarget;
            if (targetEl === this || targetEl.parentNode === this ||
                    targetEl.parentNode.parentNode === this ||
                    targetEl.parentNode.parentNode.parentNode === this) {
                return;
            }
            my.initVideoSettings("out", videoImgEl);
            evt.stopPropagation();
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
            videoEls = eventOnEl.getElementsByClassName(my.videoSelector);
            videoElsMaxIndex = videoEls.length - 1;
            for (i = videoElsMaxIndex; i >= 0; i = i - 1) {
                videoEl = videoEls[i];
                wasParsed = DyDomHelper.hasClass(videoEl, my.knownAddedCssClass);
                if (!wasParsed) {
                    DyDomHelper.addClass(videoEl, my.knownAddedCssClass);
                    videoEl.addEventListener("mouseover", my.mouseEnterVideo, false);
                    videoEl.addEventListener("mouseout", my.mouseExitVideo, false);
                    if (my.settings[PROPR_VIEW_RATING]) {
                        videoParentEl = videoEl.parentNode;
                        my.testVideoForRating(videoParentEl);
                    }
                }
            }
        },
        /**
         * 
         * @description Test for new video inserted in page
         * @param {Event} evt
         */
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
        onRequest: function onRequest(request) {
            var proprName,
                newValue,
                response,
                message;
            if (typeof request === "object") {
                if (request.message) {
                    message = request.message;
                    response = request.response;
                    if (message === "updateSettings") {
                        newValue = response.newValue;
                        proprName = response.proprName;
                        if (proprName === PROPR_VIEW_RATING) {
                            if (newValue === false || newValue === "false") {
                                newValue = false;
                            } else {
                                newValue = true;
                            }
                        } else if (proprName === PROPR_IMAGE_TIME) {
                            newValue = parseInt(newValue, 10);
                        }
                        my.settings[proprName] = newValue;
                    } else if (message === "setSettings") {
                        my.parseResponseAtGetSettings(response);
                    }
                }
            }
        },
        /**
         * 
         * @description Attach events for extension
         */
        delegateForExtension: function delegateForExtension() {
            if (window.chrome && chrome.extension) {
                chrome.extension.sendMessage("showAction");
                chrome.extension.sendMessage("getSettings");
                chrome.extension.onMessage.addListener(my.onRequest);
            } else if (self) {
                self.postMessage("getSettings");
                self.on("message", my.onRequest);
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
}());
