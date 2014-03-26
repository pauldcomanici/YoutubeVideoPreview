/**
 * Youtube Video Preview
 * @author Paul Comanici (darkyndy) <darkyndy@gmail.com>
 * @requires DyDomHelper
 * @requires ytConst.js
 * 
 */
/*jslint browser: true, devel: true */
(function () {
    "use strict";
    /*global setTimeout, DyDomHelper, XMLHttpRequest, chrome, self, PROPR_VIEW_RATING, PROPR_IMAGE_TIME */
    var my;
    my = {
        defaultImg: "default",        //default image name
        defaultImgWidth: 120,         //default image with
        baseImgPath: "http://i3.ytimg.com/vi", //base image path
        maxTestNr: 5,                 //maximum number of test to be executed on element
        hoverTimer: null,             //timer when hovering image
        hoverVideoId: "",             //video id of hovering image
        videoImgIdNr: 1,              //unique number that will be added to image id attribute
        videoImgData: {},             //object with video images data
        videoSelector: "video-thumb", //CSS class name for elements that contain video thumbnails
        videoIdReg: "([a-z0-9-_=]+)", //regular expression for video id
        ratingAddedCssClass: "",      //css class added to elements that contain video and they have rating
        knownAddedCssClass: "",       //css class added to elements that are known to have video, only if element was already parsed
        validVideoCssClass: "YtPreviewValid", //css class added on img element, only for videos for thumbnail preview
        settings: {},                         //settings object for extension
        usedPrefix: "ytVideoPreview", //prefix used for dataset
        /**
         * @description Get property name
         *   This is used to add prefix for each property so will not break YouTube UI
         * @param {String} propr
         */
        getProprName: function getProprName(propr) {
            var proprName;
            //propr = propr.charAt(0).toUpperCase() + propr.substr(1, propr.length);
            proprName = my.usedPrefix + propr;
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
                ratingElHtml,
                likes,
                ratingCount;
            try {
                resp = JSON.parse(resp);
            } catch (ex) {
                //console.log(ex.message);
            }
            if (resp && resp.data && parentEl) {
                //response has data
                likes = parseInt(resp.data.likeCount, 10); //be sure is integer
                ratingCount = parseInt(resp.data.ratingCount, 10); //be sure is integer
                if (!isNaN(likes) && !isNaN(ratingCount) && ratingCount > 0) {
                    positiveRatio = likes * 100 / ratingCount;
                    positiveRatio = Math.round(positiveRatio * 100) / 100;
                    negativeRatio = 100 - positiveRatio;
                    negativeRatio = Math.round(negativeRatio * 100) / 100;
                    ratingEl = DyDomHelper.createEl("div",
                            {"class": my.getProprName("-ratingContainer") + " " + my.getProprName("-ratingHeight" + my.settings[PROPR_RATING_HEIGHT]) });
                    ratingElHtml = '<DIV ' +
                        'class="' + my.getProprName("-ratingLikes") + '" ' +
                        'title="' + likes + ' likes from ' + ratingCount + ' rating (' + positiveRatio + '%)' + '" ' +
                        'style="width: ' + positiveRatio + '%"></DIV>' +
                        '<DIV ' +
                        'class="' + my.getProprName("-ratingDislikes") + '" ' +
                        'title="dislikes: ' + negativeRatio + '%' + '" ' +
                        'style="width: ' + negativeRatio + '%"></DIV>';
                    ratingEl.innerHTML = ratingElHtml;
                    parentEl.appendChild(ratingEl); //now add rating in page
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
         *   - isCase1 -> when it has only "related-video" or "video-list-item-link" or "related-playlist" class and nodeName is A
         *   - isCase2 -> when it has only "yt-uix-sessionlink" class and not case 1 classes and nodeName is A
         *   - isCase3 -> when it has only "yt-uix-contextlink" and nodeName is A
         *   - isCase4 -> when it has only "thumb-container" and nodeName is DIV
         *   - isCase5 -> when it has only 2 css classes: "yt-uix-sessionlink" and "yt-uix-contextlink" and nodeName is A
         * @param {HTMLElement} videoEl
         */
        testVideoForRating: function testVideoForRating(videoEl) {
            var continueTest = false,
                nodeName,
                videoId,
                videoLink = "",
                videoRegRez,
                videoIdRegExp,
                isCase1 = false,
                isCase2 = false,
                isCase3 = false,
                isCase4 = false,
                isCase5 = false,
                parentEl, //element where rating element will be inserted
                nodeClassList;
            if (videoEl && videoEl.parentNode) {
                parentEl = videoEl.parentNode;
                nodeClassList = parentEl.classList;
                nodeName = parentEl.nodeName;
                if (nodeClassList.contains("ux-thumb-wrap")) {
                    if (nodeName === "A") {
                        continueTest = true;
                    } else {
                        parentEl = parentEl.parentNode;
                        nodeName = parentEl.nodeName;
                        nodeClassList = parentEl.classList;
                        if (nodeName === "DIV") {
                            if (nodeClassList.contains("thumb-container")) {
                                isCase4 = true;
                            }
                        } else {
                            if (nodeName === "A") {
                                if (nodeClassList.contains("related-video") ||
                                        nodeClassList.contains("video-list-item-link") ||
                                        nodeClassList.contains("related-playlist")) {
                                    isCase1 = true;
                                } else {
                                    if (nodeClassList.contains("yt-uix-sessionlink")) {
                                        isCase2 = true;
                                    } else {
                                        if (nodeClassList.contains("yt-uix-contextlink")) {
                                            isCase3 = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (nodeName === "A" && nodeClassList.length === 2 &&
                            nodeClassList.contains("yt-uix-sessionlink") &&
                            nodeClassList.contains("yt-uix-contextlink")) {
                        isCase5 = true;
                    }
                }
                if (isCase1 || isCase2 || isCase3 || isCase4 || isCase5) {
                    //console.log(parentEl);
                    continueTest = true;
                    if (isCase2) {
                        parentEl = parentEl.parentNode;
                    }
                }
            }
            if (continueTest) {
            //one of cases is true
                videoLink = parentEl.getAttribute("href");
                if (videoLink && videoLink.length > 0) {
                    videoIdRegExp = new RegExp("v=" + my.videoIdReg, "i");
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
                    my.retrieveVideoData(videoId, videoEl);
                }
            }
        },
        /**
         * 
         * @description Before testing video for rating and adding it, do basic validation
         *   - rating preview is enabled;
         *   - element was already parsed
         * @param {HTMLElement} videoEl
         */
        beforeTestVideoForRating: function beforeTestVideoForRating(videoThumbEl) {
            var videoThumbClassList;
            if (my.settings[PROPR_VIEW_RATING]) {
                //ok, rating preview is enabled
                videoThumbClassList = videoThumbEl.classList;
                if (!videoThumbClassList.contains(my.ratingAddedCssClass)) {
                    //ok, element was not parsed for video rating preview
                    videoThumbClassList.add(my.ratingAddedCssClass);
                    //now test if we can apply rating to it
                    my.testVideoForRating(videoThumbEl);
                }
            }
        },
        getNewImagePath: function getNewImagePath(imgData, videoId, imgName) {
            return my.baseImgPath + imgData.pathData + "/" + videoId + "/" + imgName + imgData.imgExt;
        },
        /**
         * 
         * @description Set default image
         * @param {HTMLElement} imgEl
         * @param {String} videoId
         * @param {String} videoImgElId
         */
        setDefaultImg: function setDefaultImg(imgEl, videoId, videoImgElId) {
            var imgData;
            imgData = my.videoImgData[videoImgElId];
            if (imgData) {
                //only if we have data stored for video
                imgEl.setAttribute("src", my.getNewImagePath(imgData, videoId, imgData.imgDefault));
                DyDomHelper.setCss(imgEl, {"width": imgData.imgWidth, "top": ""});
                imgData.imgIndex = 0;
                window.clearTimeout(my.hoverTimer);
            }
        },
        /**
         * 
         * @description Switch image for video preview
         * @param {HTMLElement} imgEl
         * @param {String} videoId
         * @param {String} videoImgElId
         */
        switchVideoImg: function switchVideoImg(imgEl, videoId, videoImgElId) {
            var imgData,
                imgId,
                imageWidth,
                imageTop,
                setCss,
                updateCss = false,
                imgComputedStyle;
            if (my.hoverTimer !== null) {
                window.clearTimeout(my.hoverTimer);
            }
            if (my.hoverVideoId !== videoId) {
                if (my.hoverVideoId === "") {
                    //this means that rotate image was in loop
                    my.setDefaultImg(imgEl, videoId, videoImgElId);
                } else {
                    videoId = my.hoverVideoId;
                }
            }
            imgData = my.videoImgData[videoImgElId];
            imgId = imgData.imgIndex + 1;
            if (imgId > 3) {
                imgId = 1;
            }
            if (videoId) {
                setCss = {};
                imgComputedStyle = window.getComputedStyle(imgEl, "");
                imageWidth = parseInt(imgComputedStyle.getPropertyValue("width"), 10);
                if (imageWidth !== my.defaultImgWidth) {
                    setCss.width = my.defaultImgWidth + "px";
                    updateCss = true;
                }
                imageTop = parseInt(imgComputedStyle.getPropertyValue("top"), 10);
                if (imageTop < -12) {
                    setCss.top = 0;
                    updateCss = true;
                }
                imgEl.setAttribute("src", my.getNewImagePath(imgData, videoId, imgId));
                if (updateCss) {
                    DyDomHelper.setCss(imgEl, setCss);
                }
                imgData.imgIndex = imgId;
                my.hoverTimer = setTimeout(my.switchVideoImg, my.settings[PROPR_IMAGE_TIME], imgEl, videoId, videoImgElId);
            }
        },
        testVideoImageForMatch: function () {

        },
        /**
         * 
         * @description Test if image element is for a video
         * @param {HTMLElement} videoImgEl
         * @param {String} actType
         */
        testVideoImg: function testVideoImg(videoImgEl, actType) {
            var testNr,              //store number of tests made for a specific video
                testNrAttr,
                initImgRegExp,       //reg exp to find videoId, for jpg image
                rezReg,
                initImg,
                regMatch,
                videoId,
                videoImgElId,
                imgData;
            testNrAttr = my.getProprName("TestNr");
            testNr = videoImgEl.getAttribute(testNrAttr) || 0;
            testNr = parseInt(testNr, 10);
            if (isNaN(testNr)) {
                testNr = 0;
            }
            testNr = testNr + 1;
            if (my.maxTestNr > testNr) {
                //if we didn't reached maximum number of tests
                videoImgEl.setAttribute(testNrAttr, testNr);
                initImg = videoImgEl.getAttribute("src");
                regMatch = false;
                //default reg exp for a video thumb
                initImgRegExp = new RegExp("vi(_webp)*\\/" + my.videoIdReg + "\\/([a-z]*)(default)\\.([a-z]+)*", "i");
                if (initImg.match(initImgRegExp)) {
                    regMatch = true;
                } else {
                    initImg = videoImgEl.getAttribute("data-thumb");
                    if (initImg && initImg.match(initImgRegExp)) {
                        regMatch = true;
                    }
                }
                if (regMatch) {
                    rezReg = initImgRegExp.exec(initImg);
                    if (rezReg.length === 6) {
                        videoId = rezReg[2];
                        if (videoId !== "undefined") {
                            //continue only if videoId is not "undefined"
                            videoImgElId = videoImgEl.getAttribute("id"); //get image element id attribute
                            if (!videoImgElId) {
                                //if image element doesn't have id attribute then generete and add one
                                videoImgElId = my.getProprName("Id" + my.videoImgIdNr);
                                my.videoImgIdNr += 1;
                                videoImgEl.setAttribute("id", videoImgElId);
                            }
                            //build object with video data
                            imgData = {};
                            imgData.videoId = videoId;
                            imgData.pathData = rezReg[1] || "";
                            imgData.imgIndex = 0;
                            imgData.imgDefault = rezReg[3] + rezReg[4];
                            imgData.imgWidth = DyDomHelper.getCssProp(videoImgEl, "width");
                            imgData.imgExt = "." + rezReg[5];
                            my.videoImgData[videoImgElId] = imgData;
                            videoImgEl.setAttribute(my.getProprName("Parsed"), "true");
                            my.initVideoSettings(actType, videoImgEl);
                        }
                    }
                } else {
                    //console.log("no match at reg for: " + initImg + " , testNr: " + testNr);
                    //try again image test
                    setTimeout(my.testVideoImg, 100, videoImgEl, actType);
                }
            } else {
                if (my.maxTestNr >= testNr) {
                    testNr += 1;
                    videoImgEl.setAttribute(testNrAttr, testNr);
                }
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
                videoId,
                videoImgElId;
            parsedAttr = my.getProprName("Parsed");
            settingsParsed = videoImgEl.getAttribute(parsedAttr);
            if (settingsParsed && (settingsParsed === "true" || settingsParsed === true)) {
                settingsParsed = true;
            } else {
                settingsParsed = false;
            }
            //console.log(settingsParsed);
            if (settingsParsed === true) {
                videoImgElId = videoImgEl.getAttribute("id");
                if (videoImgElId) {
                    imgData = my.videoImgData[videoImgElId];
                    videoId = imgData.videoId;
                    if (actType === "in") {
                        if (my.hoverVideoId !== videoId) {
                            //we switched to another video images
                            my.hoverVideoId = videoId;
                            my.switchVideoImg(videoImgEl, videoId, videoImgElId);
                        }
                    } else {
                        my.setDefaultImg(videoImgEl, videoId, videoImgElId);
                        my.hoverVideoId = "";
                    }
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
            my.beforeTestVideoForRating(this);
            evt.stopPropagation();
        },
        /**
         * 
         * @description Function executed when user exits video element
         * @param {Event} evt
         */
        mouseExitVideo: function mouseExitVideo(evt) {
            var videoImgEl,
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
            videoImgEl = this.querySelector("img");
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
                    if (videoEl.offsetWidth && videoEl.offsetWidth > 50) {
                        //if element has at least 50 px in width then continue,
                        //there are elements that match selector and have 18, 32 or 48 px in width
                        //that must be ignored
                        videoEl.addEventListener("mouseover", my.mouseEnterVideo, false);
                        videoEl.addEventListener("mouseout", my.mouseExitVideo, false);
                        my.beforeTestVideoForRating(videoEl);
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
        setExtensionStyle: function (fileName) {
            var stylesheet = document.createElement('link');
            stylesheet.setAttribute('rel', 'stylesheet');
            stylesheet.setAttribute('href', fileName);
            stylesheet.setAttribute('type', 'text/css');
            document.getElementsByTagName('head')[0].appendChild(stylesheet);
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
                    } else if (message === "setStyle") {
                        my.setExtensionStyle(response.file);
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
                self.postMessage("getStyle");
                self.postMessage("getSettings");
                self.on("message", my.onRequest);
            }
        },
        /**
         * 
         * @description Initialize extension properties
         */
        initPropr: function initPropr() {
            my.ratingAddedCssClass = my.getProprName("-ratingActive");
            my.knownAddedCssClass = my.getProprName("-videoKnown");
        },
        /**
         * 
         * @description Initialize youtube video preview for page
         * @param {Object} settings
         */
        init: function init(settings) {
            my.settings = settings;
            my.initPropr();
            my.delegateForPage();
        }
    };
    my.delegateForExtension();
}());
