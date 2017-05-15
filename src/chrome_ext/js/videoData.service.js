
const videoData = (() => {
  const privateData = {};

  // object with rating data
  privateData.appendRatingObj = {};
  // settings
  privateData.settings = {};

  const service = {};

  service.add = (videoId, parentEl) => {
    if (videoId) {
      if (!privateData.appendRatingObj[videoId]) {
        privateData.appendRatingObj[videoId] = {};
      }

      privateData.appendRatingObj[videoId].parentEl = parentEl;

      service.retrieveVideoDataDebounced();
    }
  };

  service.updateSettings = (settings) => {
    privateData.settings = settings;
  };

  service.populateVideoRating = (videoId) => {

    if (videoId && privateData.appendRatingObj[videoId]) {
      const videoData = privateData.appendRatingObj[videoId];
      const likes = parseInt(videoData.likeCount, 10); //be sure is integer
      const dislikes = parseInt(videoData.dislikeCount, 10); //be sure is integer
      const ratingCount = likes + dislikes;

      if (!isNaN(likes) && !isNaN(ratingCount) && ratingCount > 0) {
        if (videoData.parentEl) {
          // continue only if we have parentEl
          const parentEl = videoData.parentEl;
          const ratingElCssClass = cssProps.getProprName('ratingContainer');
          const ratingEl = parentEl.querySelector('.' + ratingElCssClass);

          if (!ratingEl) {
            // in case rating element was not added
            let positiveRatio = likes * 100 / ratingCount;
            positiveRatio = Math.round(positiveRatio * 100) / 100;
            let negativeRatio = 100 - positiveRatio;
            negativeRatio = Math.round(negativeRatio * 100) / 100;

            const ratingEl = DyDomHelper.createEl(
              'div',
              {
                'class': ratingElCssClass + ' ' + cssProps.getProprName('ratingHeight' + privateData.settings[PROPR_RATING_HEIGHT])
              }
            );

            const ratingElHtml = '<DIV ' +
              'class="' + cssProps.getProprName('ratingLikes') + '" ' +
              'title="' + likes + ' likes from ' + ratingCount + ' rating (' + positiveRatio + '%)' + '" ' +
              'style="width: ' + positiveRatio + '%; background: ' + privateData.settings[PROPR_RATING_LIKE_COLOR] + ';">' +
              '</DIV>' +
              '<DIV ' +
              'class="' + cssProps.getProprName('ratingDislikes') + '" ' +
              'title="dislikes: ' + negativeRatio + '%' + '" ' +
              'style="width: ' + negativeRatio + '%; background: ' + privateData.settings[PROPR_RATING_DISLIKE_COLOR] + ';">' +
              '</DIV>';

            ratingEl.innerHTML = ratingElHtml;

            // now add rating in page
            parentEl.appendChild(ratingEl);
          }
        }
      }
    }
  };

  /**
   *
   * @description Add video rating
   * @param {Object} resp
   */
  service.appendRating = (resp) => {
    try {
      resp = JSON.parse(resp);
    } catch (ex) {
      // console.log(ex.message);
    }

    if (resp && resp.items && resp.items.length > 0) {
      // response has video items
      resp.items.forEach((item) => {
        const videoId = item.id;
        const videoRatingData = privateData.appendRatingObj[videoId];
        if (videoId && videoRatingData && videoRatingData.parentEl) {
          // add rating data to local object (doing this as we do not want to re-fetch same data multiple times)
          videoRatingData.likeCount = item.statistics.likeCount;
          videoRatingData.dislikeCount = item.statistics.dislikeCount;

          // now set rating for video
          service.populateVideoRating(videoId);
        }
      });
    }
  };

  /**
   *
   * @description Retrieve video data
   */
  service.retrieve = () => {
    const videoIds = Object.keys(privateData.appendRatingObj);

    if (videoIds.length > 0) {
      // API doesn't support more then 50 id's so make sure to send maximum 50
      do {
        const tempVideoIds = videoIds.splice(0, 50);
        const videoIdsString = tempVideoIds.join(',');
        const reqUrl = 'https://www.googleapis.com/youtube/v3/videos/';
        const reqData = `part=statistics&id=${videoIdsString}&key=AIzaSyAKHgX0wWr82Ko24rnJSBqs8FFvHns21a4`;
        ajax.execute('GET', reqUrl, reqData, [], service.appendRating);
      } while (videoIds.length !== 0);
    }
    // reqUrl = 'http://gdata.youtube.com/feeds/api/videos/' + videoId;
    // reqData = 'v=2&prettyprint=false&alt=jsonc';
  };

  service.init = () => {
    service.retrieveVideoDataDebounced = dyUtils.debounce(service.retrieve, 20);
  };

  service.init();

  return service;
})();
