/**
 * Youtube Video Preview
 * @author Paul Comanici (darkyndy) <darkyndy@gmail.com>
 * @requires DyDomHelper
 * @requires ytConst.js
 *
 * TODO: refactor is needed
 *
 */
(() => {
  'use strict';
  const privateData = {};

  // default image name
  privateData.defaultImg = 'default';
  // default image with
  privateData.defaultImgWidth = 120;
  // base image path
  privateData.baseImgPath = '//i.ytimg.com/vi';
  // maximum number of test to be executed on element
  privateData.maxTestNr = 5;
  // timer when hovering image
  privateData.hoverTimer = null;
  // video id of hovering image
  privateData.hoverVideoId = '';
  // unique number that will be added to image id attribute
  privateData.videoImgIdNr = 1;
  // object with video images data
  privateData.videoImgData = {};
  // regular expression for video id
  privateData.videoIdReg = '([a-z0-9-_=]+)';
  // css class added to elements that contain video and they have rating
  privateData.ratingAddedCssClass = '';
  // css class added to elements that are known to have video, only if element was already parsed
  privateData.knownAddedCssClass = '';
  // settings
  privateData.settings = {};
  // flag for the new UI (allow support for old UI)
  privateData.newUI = false;

  const service = {};

  // configuration of the observer: (on node changes)
  service.nodeObserverConfig = {
    attributes: false,
    childList: true,
    characterData: false,
  };

  // configuration of the observer: (on attribute changes)
  service.attrObserverConfig = {
    attributes: true,
    childList: false,
    characterData: false,
  };

  service.mutationCb = (mutations) => {
    mutations.forEach(service.thumbnailChanges);
  };

  service.thumbnailChanges = (mutation) => {
    const el = mutation.target;
    service.delegateOnVideoThumb([el]);
  };

  service.elementAttrObserver = new MutationObserver(service.mutationCb);

  service.getThumbnailEl = (matchedEl) => {
    let thumbnailEl = null;
    if (matchedEl.children && matchedEl.children.thumbnail) {
      thumbnailEl = matchedEl.children.thumbnail;
    }

    return thumbnailEl;
  };

  service.getVideoIdFromLink = (videoLink) => {
    let videoId = '';
    if (videoLink && videoLink.length > 0) {
      const videoIdRegExp = new RegExp('v=' + privateData.videoIdReg, 'i');
      if (videoLink.match(videoIdRegExp)) {
        const videoRegRez = videoIdRegExp.exec(videoLink);
        videoId = videoRegRez[1];
      }
    }

    return videoId;
  };

  service.getVideoIdFromLinkElement = (videoEl) => {
    const videoLink = videoEl.getAttribute('href');

    const videoId = service.getVideoIdFromLink(videoLink);

    return videoId;
  };


  /**
   *
   * @description Find video id for rating, in case 4 when parent element is DIV
   * @param {HTMLElement} parentEl
   */
  service.findVideoId = (parentEl) => {
    var imgEl,
      imgSrc,
      initImgRegExp,
      rezReg,
      videoId = "";
    imgEl = parentEl.querySelector("img");
    if (imgEl) {
      imgSrc = imgEl.getAttribute("src");
      if (imgSrc) {
        initImgRegExp = new RegExp("\\/vi\\/" + privateData.videoIdReg + "\\/", "i");
        if (imgSrc.match(initImgRegExp)) {
          rezReg = initImgRegExp.exec(imgSrc);
          if (rezReg.length === 2) {
            videoId = rezReg[1];
          }
        }
      }
    }

    return videoId;
  };

  /**
   *
   */
  service.testVideoForRatingOld_SubCheck = (videoMatch, nodeName, nodeClassList, asNewRelated) => {
    // TODO: remove this when YouTube updated everybody with latest UI
    asNewRelated = asNewRelated || false;
    if (nodeName === 'A') {
      if (nodeClassList.contains('related-video') ||
        nodeClassList.contains('video-list-item-link') ||
        nodeClassList.contains('related-playlist')) {
        if (asNewRelated) {
          videoMatch.isCase6 = true;
        } else {
          videoMatch.isCase1 = true;
        }
      } else {
        if (nodeClassList.contains('yt-uix-sessionlink')) {
          if (asNewRelated) {
            videoMatch.isCase7 = true;
          } else {
            videoMatch.isCase2 = true;
          }
        } else {
          if (nodeClassList.contains('yt-uix-contextlink')) {
            if (asNewRelated) {
              videoMatch.isCase8 = true;
            } else {
              videoMatch.isCase3 = true;
            }
          }
        }
      }
    }
    return videoMatch;
  };

  service.testVideoForRatingOld = (videoEl) => {
    var continueTest = false,
      nodeName,
      videoId,
      videoLink = "",
      videoRegRez,
      videoIdRegExp,
      videoMatch = {
      },
      matchesCaseKey,
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
              videoMatch.isCase4 = true;
            }
          } else {
            videoMatch = service.testVideoForRatingOld_SubCheck(videoMatch, nodeName, nodeClassList);
          }
        }
      } else {
        if (nodeName === "A" && nodeClassList.length === 2 &&
          nodeClassList.contains("yt-uix-sessionlink") &&
          nodeClassList.contains("yt-uix-contextlink")) {
          videoMatch.isCase5 = true;
        } else {
          videoMatch = service.testVideoForRatingOld_SubCheck(videoMatch, nodeName, nodeClassList, true);
        }
      }
      for (matchesCaseKey in videoMatch) {
        if (videoMatch.hasOwnProperty(matchesCaseKey)) {
          if (videoMatch[matchesCaseKey]) {
            continueTest = true;
            break;
          }
        }
      }
    }

    if (continueTest) {
      //one of cases is true
      if (videoMatch.isCase2) {
        parentEl = parentEl.parentNode;
      }
      videoLink = parentEl.getAttribute("href");
      if (videoLink && videoLink.length > 0) {
        videoIdRegExp = new RegExp("v=" + privateData.videoIdReg, "i");
        if (videoLink.match(videoIdRegExp)) {
          videoRegRez = videoIdRegExp.exec(videoLink);
          videoId = videoRegRez[1];
        }
      } else {
        if (videoMatch.isCase4) {
          videoId = service.findVideoId(parentEl);
        }
      }

      if (videoId) {
        //console.log(videoId);
        if (videoMatch.isCase6) {
          parentEl = videoEl;
        }

        videoData.add(videoId, parentEl);
      }
    }
  };

  service.testVideoForRating = (videoEl) => {
    let continueTest = false;
    let parentEl;

    if (privateData.newUI) {
      if (videoEl && videoEl.parentNode) {
        // element where rating element will be inserted (parentEl)
        parentEl = videoEl.parentNode;
        const nodeName = parentEl.nodeName;
        if (nodeName === 'YTD-THUMBNAIL') {
          continueTest = true;
        }
      }

      // separation (for multiple conditions)
      if (continueTest) {
        const videoId = service.getVideoIdFromLinkElement(videoEl);

        videoData.add(videoId, parentEl);
      }

    } else {
      // old YouTube UI
      service.testVideoForRatingOld(videoEl);
    }
  };


  service.addRatingCssClassToBody = () => {
    if (privateData.settings[PROPR_VIEW_RATING]) {
      //ok, rating preview is enabled, add on body class for rating active
      document.body.classList.add(privateData.ratingAddedCssClass);
    }
  };
  /**
   *
   * @description Before testing video for rating and adding it, do basic validation
   *   - rating preview is enabled;
   *   - element was already parsed
   * @param {HTMLElement} videoThumbEl
   */
  service.beforeTestVideoForRating =(videoThumbEl) => {
    var videoThumbClassList;
    if (privateData.settings[PROPR_VIEW_RATING]) {
      // ok, rating preview is enabled
      videoThumbClassList = videoThumbEl.classList;
      if (!videoThumbClassList.contains(privateData.ratingAddedCssClass)) {
        // ok, element was not parsed for video rating preview
        videoThumbClassList.add(privateData.ratingAddedCssClass);
      }
      // TODO: this part should be improved (less checking)
      // now test if we can apply rating to it
      service.testVideoForRating(videoThumbEl);
    }
  };

  service.getNewImagePath = (imgData, videoId, imgName) => {
    return privateData.baseImgPath + imgData.pathData + '/' + videoId + '/' + imgName + imgData.imgExt;
  };
  /**
   *
   * @description Set default image
   * @param {HTMLElement} imgEl
   * @param {String} videoId
   * @param {String} videoImgElId
   */
  service.setDefaultImg = (imgEl, videoId, videoImgElId) => {
    var imgData;
    imgData = privateData.videoImgData[videoImgElId];
    if (imgData) {
      //only if we have data stored for video
      imgEl.setAttribute('src', service.getNewImagePath(imgData, videoId, imgData.imgDefault));
      imgData.imgIndex = 0;
      window.clearTimeout(privateData.hoverTimer);
    }
  };

  /**
   *
   * @description Switch image for video preview
   * @param {HTMLElement} imgEl
   * @param {String} videoId
   * @param {String} videoImgElId
   */
  service.switchVideoImg = (imgEl, videoId, videoImgElId) => {
    var imgData,
      imgId,
      newImgSrc,
      imgCached;
    if (privateData.hoverTimer !== null) {
      window.clearTimeout(privateData.hoverTimer);
    }
    if (privateData.hoverVideoId !== videoId) {
      if (privateData.hoverVideoId === '') {
        //this means that rotate image was in loop
        service.setDefaultImg(imgEl, videoId, videoImgElId);
      } else {
        videoId = privateData.hoverVideoId;
      }
    }
    imgData = privateData.videoImgData[videoImgElId];
    imgId = imgData.imgIndex + 1;
    if (imgId > 3) {
      imgId = 1;
    }

    if (videoId) {
      if (imgData.correctExtension === false) {
        //if we couldn't find correct extension ... don't try any more
        return;
      }
      newImgSrc = service.getNewImagePath(imgData, videoId, imgId);
      imgEl.setAttribute('src', newImgSrc);
      if (!imgData.correctExtension) {
        //start image caching, used for fixing image extension
        imgCached = new Image();
        imgCached.onload = function () {
          imgData.correctExtension = true;
        };
        imgCached.onerror = function () {
          if (imgData.imgExt === '.jpg') {
            imgData.imgExt = '.webp';
            imgData.pathData = '_webp';
          } else if (imgData.imgExt === '.webp') {
            imgData.imgExt = '.jpg';
            imgData.pathData = '';
          } else {
            imgData.correctExtension = false;
          }
        };
        imgCached.src = newImgSrc;
      }

      // TODO: show also image number while hovering (indication of thumbnail number)

      imgData.imgIndex = imgId;

      privateData.hoverTimer = setTimeout(
        service.switchVideoImg,
        privateData.settings[PROPR_IMAGE_TIME],
        imgEl,
        videoId,
        videoImgElId
      );
    }
  };

  /**
   *
   * @description Test if image element is for a video
   * @param {HTMLElement} videoImgEl
   * @param {String} actType
   */
  service.testVideoImg = (videoImgEl, actType) => {
    var testNr,              //store number of tests made for a specific video
      testNrAttr,
      initImgRegExp,       //reg exp to find videoId, for jpg image
      rezReg,
      initImg,
      videoId,
      videoImgElId,
      imgData;

    let regMatch = false;

    testNrAttr = cssProps.getProprName('TestNr');
    testNr = videoImgEl.getAttribute(testNrAttr) || 0;
    testNr = parseInt(testNr, 10);
    if (isNaN(testNr)) {
      testNr = 0;
    }
    testNr = testNr + 1;
    if (privateData.maxTestNr > testNr) {
      //if we didn't reached maximum number of tests
      videoImgEl.setAttribute(testNrAttr, testNr);
      initImg = videoImgEl.getAttribute('src');
      if (!initImg) {
        // get video A element (parent)
        const videoEl = videoImgEl.parentElement.parentElement;
        const videoId = service.getVideoIdFromLinkElement(videoEl);
        if (videoId) {
          // if we found videoId on parent, reset test to 0, in the end we will have src for img element
          testNr = 0;
        }
      } else {
        //default reg exp for a video thumb
        initImgRegExp = new RegExp('vi(_webp)*\\/' + privateData.videoIdReg + '\\/([a-z]*)(default)\\.([a-z]+)*', 'i');
        if (initImg.match(initImgRegExp)) {
          regMatch = true;
        }
      }

      if (regMatch) {
        rezReg = initImgRegExp.exec(initImg);
        if (rezReg.length === 6) {
          videoId = rezReg[2];
          if (videoId !== 'undefined') {
            //continue only if videoId is not 'undefined'
            const attrName = cssProps.getProprName('id');
            videoImgElId = videoImgEl.getAttribute(attrName); //get image element ytVideoPreview-id attribute
            if (!videoImgElId) {
              //if image element doesn't have id attribute then generete and add one
              videoImgElId = cssProps.getProprName('Id' + privateData.videoImgIdNr);
              privateData.videoImgIdNr += 1;
              videoImgEl.setAttribute(attrName, videoImgElId);
            }
            //build object with video data
            imgData = {};
            imgData.videoId = videoId;
            imgData.pathData = rezReg[1] || '';
            imgData.imgIndex = 0;
            imgData.imgDefault = rezReg[3] + rezReg[4];
            imgData.imgExt = '.' + rezReg[5];
            privateData.videoImgData[videoImgElId] = imgData;
            videoImgEl.setAttribute(cssProps.getProprName('Parsed'), 'true');
            service.initVideoSettings(actType, videoImgEl);
          }
        }
      } else {
        //console.log('no match at reg for: ' + initImg + ' , testNr: ' + testNr);
        //try again image test
        setTimeout(service.testVideoImg, 100, videoImgEl, actType);
      }
    } else {
      if (privateData.maxTestNr >= testNr) {
        testNr += 1;
        videoImgEl.setAttribute(testNrAttr, `${testNr}`);
      }
    }
  };

  /**
   *
   * @description Initialize video settings
   * @param {String} actType
   * @param {HTMLElement} videoImgEl
   */
  service.initVideoSettings = (actType, videoImgEl) => {
    var imgData,
      settingsParsed,
      parsedAttr,
      videoId,
      videoImgElId;
    parsedAttr = cssProps.getProprName('Parsed');
    settingsParsed = videoImgEl.getAttribute(parsedAttr);
    if (settingsParsed && (settingsParsed === 'true' || settingsParsed === true)) {
      settingsParsed = true;
    } else {
      settingsParsed = false;
    }
    //console.log(settingsParsed);
    if (settingsParsed === true) {
      const attrName = cssProps.getProprName('id');
      videoImgElId = videoImgEl.getAttribute(attrName);
      if (videoImgElId) {
        imgData = privateData.videoImgData[videoImgElId];
        videoId = imgData.videoId;
        if (actType === 'in') {
          if (privateData.hoverVideoId !== videoId) {
            //we switched to another video images
            privateData.hoverVideoId = videoId;
            service.switchVideoImg(videoImgEl, videoId, videoImgElId);
          }
        } else {
          service.setDefaultImg(videoImgEl, videoId, videoImgElId);
          privateData.hoverVideoId = '';
        }
      }
    } else {
      service.testVideoImg(videoImgEl, actType);
    }
  };

  /**
   *
   * @description Function executed when user enters video element
   * Note: don't call evt.stopPropagation() as it will block YouTube showing add to quick list
   * @param {Event} evt
   */
  service.mouseEnterVideo = (linkVideoEl) => (evt) => {
    var videoImgEl;
    //console.log('hover in');
    videoImgEl = linkVideoEl.querySelector('img');
    service.initVideoSettings('in', videoImgEl);
    service.beforeTestVideoForRating(linkVideoEl);
  };

  /**
   *
   * @description Function executed when user exits video element
   * @param {Event} evt
   */
  service.mouseExitVideo = (linkVideoEl) => (evt) => {
    var videoImgEl,
      targetEl;
    //console.log('hover out');
    targetEl = evt.toElement || evt.relatedTarget;
    if (targetEl) {
      if (targetEl === linkVideoEl || targetEl.parentNode === linkVideoEl ||
        targetEl.parentNode.parentNode === linkVideoEl ||
        targetEl.parentNode.parentNode.parentNode === linkVideoEl) {
        return;
      }
    }
    videoImgEl = linkVideoEl.querySelector('img');
    service.initVideoSettings('out', videoImgEl);
    evt.stopPropagation();
  };

  /**
   *
   * Attach mouse event for video thumb
   *
   * @param {Array} videoEls
   */
  service.delegateOnVideoThumb = (videoEls) => {
    let videoElsMaxIndex;
    let videoEl;
    let i;
    let wasParsed;
    
    if (privateData.settings[PROPR_VIEW_RATING] || privateData.settings[PROPR_IMAGE_TIME] > 0) {
      // if we have preview or rating enabled
      videoElsMaxIndex = videoEls.length - 1;

      for (i = videoElsMaxIndex; i >= 0; i = i - 1) {
        videoEl = videoEls[i];

        let linkVideoEl;

        if (privateData.newUI) {
          const videoElNode = videoEl.nodeName;
          if (videoElNode === 'YTD-THUMBNAIL') {
            // parent element
            const thumbnailEl = service.getThumbnailEl(videoEl);
            if (thumbnailEl) {
              linkVideoEl = thumbnailEl;
            }
          } else if (videoElNode === 'A') {
            linkVideoEl = videoEl;
          }
        } else {
          // old UI
          linkVideoEl = videoEl;
        }

        if (linkVideoEl) {
          if (privateData.settings[PROPR_IMAGE_TIME] > 0) {
            wasParsed = linkVideoEl.classList.contains(privateData.knownAddedCssClass);

            if (!wasParsed) {
              linkVideoEl.classList.add(privateData.knownAddedCssClass);

              if (linkVideoEl.offsetWidth === 0 || linkVideoEl.offsetWidth > 50) {
                // if element has 0 OR at least 50 px in width then continue,
                //  there are elements hidden => take them in consideration
                //  there are elements that match selector and have 18, 32 or 48 px in width => ignore
                linkVideoEl.addEventListener('mouseover', service.mouseEnterVideo(linkVideoEl), false);
                linkVideoEl.addEventListener('mouseout', service.mouseExitVideo(linkVideoEl), false);
              }
            }
          }
          
          service.beforeTestVideoForRating(linkVideoEl);
        }
      }
    }
  };

  service.testForElementMutation = (mutations) => {
    mutations.forEach(service.testForNewVideo)
  },
  /**
   *
   * @description Test for new video inserted in page
   * @param {Event} evt
   */
  service.testForNewVideo = (evt) => {
    // el ytd-thumbnail & child with class ytd-thumbnail (el as a)
    let matchedEls = [];

    const el = evt.target;

    if (privateData.newUI) {

      const nodeType = el.nodeType;
      if (nodeType === Node.ELEMENT_NODE) {
        matchedEls = el.getElementsByTagName('ytd-thumbnail');
      }

      const matchedElsLength = matchedEls.length;
      if (matchedElsLength) {

        service.delegateOnVideoThumb(matchedEls);

        for (let i = 0; i < matchedElsLength; i += 1) {
          const matchedEl = matchedEls[i];
          const thumbnailEl = service.getThumbnailEl(matchedEl);
          if (thumbnailEl) {
            service.elementAttrObserver.observe(thumbnailEl, service.attrObserverConfig);
          }

        }

        service.addRatingCssClassToBody();
      }
    } else {
      // old UI
      let continueLogic = true;
      const nodeName = el.nodeName.toLowerCase();
      if (nodeName === "#comment" || nodeName === "#text" || nodeName === "script" ||
        nodeName === "style" || nodeName === "link" || nodeName === "input" ||
        nodeName === "iframe") {
        continueLogic = false;
      }
      if (continueLogic) {
        //console.log(nodeName);
        service.delegateMouseEvt(el);
        service.addRatingCssClassToBody();
      }
    }

  };

  /**
   *
   * @description Attach mouse event for video
   * @param eventOnEl
   */
  service.delegateMouseEvt = (eventOnEl) => {
    if (!eventOnEl) {
      eventOnEl = document.getElementById('body-container');
      if (!eventOnEl) {
        eventOnEl = document;
      }
    }

    const thumbnailEls = eventOnEl.getElementsByTagName('ytd-thumbnail');

    privateData.newUI = thumbnailEls.length ? true : false;

    if (privateData.newUI) {
      // new UI
      service.delegateOnVideoThumb(thumbnailEls);
    } else {
      // old UI
      service.delegateOnVideoThumb(eventOnEl.getElementsByClassName('video-thumb'));
      service.delegateOnVideoThumb(eventOnEl.getElementsByClassName('yt-uix-simple-thumb-wrap'));
    }


  };

  /**
   *
   * @description Attach events for page
   */
  service.delegateForPage = () => {
    // create an observer instance linked to the callback function
    const observer = new MutationObserver(service.testForElementMutation);
    // ctart observing the target node for configured mutations
    observer.observe(
      document.getElementsByTagName('body')[0],
      {
        attributes: false,
        childList: true,
        subtree: true,
      }
    );
    service.delegateMouseEvt();
  };
  /**
   *
   * @description Attach events for extension
   */
  service.delegateForExtension = () => {
    if (window.chrome && chrome.extension) {
      chrome.extension.sendMessage('showAction');
      chrome.extension.sendMessage('getSettings');
      chrome.extension.onMessage.addListener(service.onRequest);
    } else if (self) {
      self.postMessage('getStyle');
      self.postMessage('getSettings');
      self.on('message', service.onRequest);
    }
  };

  /**
   *
   * @description Parse response at get settings
   * @param {Object} response
   */
  service.parseResponseAtGetSettings = (response) => {

    if (typeof response === 'object') {
      if (response.settings) {
        service.init(response.settings);
      }
    }
  };

  /**
   *
   * @description Set extension stylesheet
   * @param {String} fileName
   */
  service.setExtensionStyle = (fileName) => {
    const stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', fileName);
    stylesheet.setAttribute('type', 'text/css');

    document.getElementsByTagName('head')[0].appendChild(stylesheet);
  };

  /**
   *
   * @description Called when a message is passed.
   * @param {Object} request
   */
  service.onRequest = (request) => {
    if (typeof request === 'object') {
      if (request.message) {
        const message = request.message;
        const response = request.response;

        if (message === 'updateSettings') {
          let newValue = response.newValue;
          const proprName = response.proprName;
          if (proprName === PROPR_VIEW_RATING) {
            if (newValue === false || newValue === 'false') {
              newValue = false;
            } else {
              newValue = true;
            }
          } else if (proprName === PROPR_IMAGE_TIME) {
            newValue = parseInt(newValue, 10);
          }
          privateData.settings[proprName] = newValue;

          videoData.updateSettings(privateData.settings);

        } else if (message === 'setSettings') {
          service.parseResponseAtGetSettings(response);
        } else if (message === 'setStyle') {
          service.setExtensionStyle(response.file);
        } else if (message === 'setVideoData') {
          videoData.appendRating(response);
        }
      }
    }
  };

  /**
   * @description Initialize extension properties
   */
  service.initPropr = () => {
    privateData.ratingAddedCssClass = cssProps.getProprName('ratingActive');
    privateData.knownAddedCssClass = cssProps.getProprName('videoKnown');

    service.addRatingCssClassToBody();
  };

  /**
   * @description Initialize youtube video preview for page
   * @param {Object} settings
   */
  service.init = (settings) => {
    privateData.settings = settings;
    videoData.updateSettings(settings);
    service.initPropr();
    service.delegateForPage();
  };

  service.delegateForExtension();
})();
