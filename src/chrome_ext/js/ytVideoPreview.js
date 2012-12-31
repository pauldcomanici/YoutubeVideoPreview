/**
 * Youtube Preview
 */
/*jslint browser: true, devel: true */
(function () {
    "use strict";
    /*global setTimeout, DyDomHelper, XMLHttpRequest, ActiveXObject, chrome, self, PROPR_VIEW_RATING, PROPR_IMAGE_TIME */
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
         * @description Filter CSS property by setting to integer
         * @param {String} propVal
         */
        cssPropAsInt: function filterCssProp(propVal) {
            propVal = parseInt(propVal, 10);
            if (isNaN(propVal)) {
                propVal = 0;
            }
            return propVal;
        },
        /**
         * 
         * @description Add video rating
         * @param resp
         * @param {HTMLElement} parentEl
         */
        appendRating: function appendRating(resp, parentEl) {
            var positiveRatio,
                negativeRatio,
                ratingEl,
                ratingHeight = 3,
                ratingHeightPx,
                likesEl,
                dislikesEl,
                likes,
                ratingCount,
                ratingElCss,
                parentElCss,
                videoThumbEl,
                likesCss,
                parentElWidth = "138px",
                parentElHeight = 0,
                parentElLeft = 0,
                parentHasClassUxThumb = false,
                retrieveLeftCssProps,
                parentElCssProps;
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
            if (resp && resp.data && parentEl) {
                //response has data
                if (isStringOrNumber(resp.data.likeCount)) {
                    likes = parseInt(resp.data.likeCount, 10);
                    if (isStringOrNumber(resp.data.ratingCount)) {
                        ratingCount = parseInt(resp.data.ratingCount, 10);
                        positiveRatio = likes * 100 / ratingCount;
                        positiveRatio = parseFloat(positiveRatio.toFixed(2));
                        negativeRatio = (100 - positiveRatio).toFixed(2);
                        ratingHeightPx = ratingHeight + "px";
                        if (DyDomHelper.hasClass(parentEl, "ux-thumb-wrap")) {
                            parentHasClassUxThumb = true;
                        } else {
                            //find videoThumbEl only if parent element doesn't have required css class
                            videoThumbEl = parentEl.querySelector(".ux-thumb-wrap");
                        }
                        parentElCssProps = window.getComputedStyle(parentEl, "");
                        parentElWidth = parentElCssProps.getPropertyValue("width");
                        parentElHeight = my.cssPropAsInt(parentElCssProps.getPropertyValue("height"));
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
                        parentElHeight = parentElHeight + 1;
                        //ratingElCss.top = parentElHeight + "px";
                        if (parentHasClassUxThumb) {
                            ratingElCss.maxWidth = parentElWidth;
                        }
                        if (parentEl.nodeName === "LI" && DyDomHelper.hasClass(parentEl, "video-list-item")) {
                            retrieveLeftCssProps = window.getComputedStyle(parentEl.childNodes[0], "");
                        } else {
                            retrieveLeftCssProps = parentElCssProps;
                        }
                        parentElLeft = my.cssPropAsInt(retrieveLeftCssProps.getPropertyValue("padding-left"));
                        parentElLeft += my.cssPropAsInt(retrieveLeftCssProps.getPropertyValue("margin-left"));
                        if (parentElLeft > 0) {
                            ratingElCss.left = parentElLeft + "px";
                        }
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
                        ratingEl.appendChild(likesEl); //add like element
                        ratingEl.appendChild(dislikesEl); //add dislike element
                        parentEl.appendChild(ratingEl); //now add rating in page
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
                console.log("Cannot initialize XHR request");
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
         * @description Find video id for rating, in case 4 when parent element is DIV
         * @param {HTMLElement} parentEl
         */
        findVideoId: function findVideoId(parentEl) {
            var imgEl,
                imgSrc,
                initImgRegExp,
                rezReg,
                videoId = "";
            imgEl = parentEl.querySelector("img");
            if (imgEl) {
                imgSrc = imgEl.getAttribute("src");
                if (imgSrc) {
                    initImgRegExp = new RegExp("\\/vi\\/" + my.videoIdReg + "\\/", "i");
                    if (imgSrc.match(initImgRegExp)) {
                        rezReg = initImgRegExp.exec(imgSrc);
                        if (rezReg.length === 2) {
                            videoId = rezReg[1];
                        }
                    }
                }
            }
            return videoId;
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
                videoId,
                videoLink = "",
                videoRegRez,
                videoIdRegExp = new RegExp("v=" + my.videoIdReg, "i"),
                isCase1 = false, //when it has only "related-video" or "video-list-item-link" or "related-playlist" class and nodeName is A
                isCase2 = false, //when it has only "yt-uix-sessionlink" class and not case 1 classes and nodeName is A
                isCase3 = false, //when it has only "yt-uix-contextlink" and nodeName is A
                isCase4 = false, //when it has only "thumb-container" and nodeName is DIV
                parentEl;
            if (videoEl && videoEl.parentNode) {
                videoEl = videoEl.parentNode;
                if (DyDomHelper.hasClass(videoEl, "ux-thumb-wrap")) {
                    nodeName = videoEl.nodeName;
                    if (nodeName === "A") {
                        parentEl = videoEl;
                        continueTest = true;
                    } else {
                        videoEl = videoEl.parentNode;
                        nodeName = videoEl.nodeName;
                        if (nodeName === "DIV") {
                            if (DyDomHelper.hasClass(videoEl, "thumb-container")) {
                                isCase4 = true;
                            }
                        } else {
                            if (nodeName === "A") {
                                if (DyDomHelper.hasClass(videoEl, "related-video") ||
                                        DyDomHelper.hasClass(videoEl, "video-list-item-link") ||
                                        DyDomHelper.hasClass(videoEl, "related-playlist")) {
                                    isCase1 = true;
                                } else {
                                    if (DyDomHelper.hasClass(videoEl, "yt-uix-sessionlink")) {
                                        isCase2 = true;
                                    } else {
                                        if (DyDomHelper.hasClass(videoEl, "yt-uix-contextlink")) {
                                            isCase3 = true;
                                        }
                                    }
                                }
                            }
                        }
                        if (isCase1 || isCase2 || isCase3 || isCase4) {
                            //console.log(parentEl);
                            continueTest = true;
                            parentEl = videoEl;
                            if (isCase2) {
                                parentEl = parentEl.parentNode;
                            }
                        }
                    }
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
                        }
                    } else {
                        if (isCase4) {
                            videoId = my.findVideoId(parentEl);
                        }
                    }
                    if (videoId) {
                        //console.log(videoId);
                        my.retrieveVideoData(videoId, parentEl);
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
            imgData[my.getDatasetPropr("ImgIndex")] = 0;
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
                setCss = {};
                imageWidth = DyDomHelper.getCssProp(imgEl, "width", true);
                if (imageWidth !== my.defaultImgWidth) {
                    setCss.width = my.defaultImgWidth + "px";
                    updateCss = true;
                }
                imageTop = DyDomHelper.getCssProp(imgEl, "top", true);
                if (imageTop < -12) {
                    setCss.top = 0;
                    updateCss = true;
                }
                newImgPath = my.defaultImgPath + videoId + "/" + imgId + my.imgExt;
                imgEl.setAttribute("src", newImgPath);
                if (updateCss) {
                    DyDomHelper.setCss(imgEl, setCss);
                }
            }
            imgData[my.getDatasetPropr("ImgIndex")] = imgId;
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
                videoId,
                imgData;
            imgData = videoImgEl.dataset;
            testNr = imgData[my.getDatasetPropr("TestNr")];
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
                imgData[my.getDatasetPropr("TestNr")] = testNr;
                regMatch = false;
                initImgRegExp = new RegExp("vi\\/" + my.videoIdReg + "\\/([a-z]*)(default)\\.", "i");
                initImg = videoImgEl.getAttribute("src");
                if (initImg.match(initImgRegExp)) {
                    regMatch = true;
                } else {
                    initImg = imgData.thumb;
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
                        imgData[my.getDatasetPropr("VideoId")] = videoId;
                        imgData[my.getDatasetPropr("ImgIndex")] = 0;
                        imgData[my.getDatasetPropr("ImgDefault")] = useDefaultImage;
                        imgData[my.getDatasetPropr("ImgWidth")] = useWidth;
                        imgData[my.getDatasetPropr("Parsed")] = true;
                        if (videoId !== "undefined") {
                            my.initVideoSettings("in", videoImgEl);
                        }
                    }
                } else {
                    //console.log("no match at reg for: "+initImg+" , testNr: "+testNr);
                    setTimeout(my.testVideoImg, 100, videoImgEl, actType);
                }
            } else if (my.maxTestNr >= testNr) {
                imgData[my.getDatasetPropr("TestNr")] = testNr + 1;
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
            var videoImgEl;
            //console.log('hover in');
            videoImgEl = this.querySelector("img");
            my.initVideoSettings("in", videoImgEl);
            if (my.settings[PROPR_VIEW_RATING]) {
                my.testVideoForRating(this);
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
            if (targetEl) {
                if (targetEl === this || targetEl.parentNode === this ||
                        targetEl.parentNode.parentNode === this ||
                        targetEl.parentNode.parentNode.parentNode === this) {
                    return;
                }
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
                        my.testVideoForRating(videoEl);
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
