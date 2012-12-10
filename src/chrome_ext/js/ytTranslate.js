/**
 * 
 * @description Translation class
 */
(function () {
	"use strict";
	/*global chrome, document*/
	/**
	 * @description Add localization
	 *     find element with id -> elementId
	 *     and set for it i18n string found under messageKey
	 *     this set is done based on setAs parameter that can be "textContent" or "value"
	 *       by default is "textContent"
	 * @param {String} elementId
	 * @param {String} messageKey
	 * @param {String} setAs
	 */
	function addLocalization(elementId, messageKey, setAs) {
		var el;
		el = document.getElementById(elementId);
		if (el) {
			setAs = setAs || "textContent";
			el[setAs] = chrome.i18n.getMessage(messageKey);
		}
	}
	/**
	 * @description Translate site.html
	 */
	function translateSitePage() {
		//site.html page
		addLocalization("headerTitle", "extensionName");
		addLocalization("page_feedback", "feedback");
		addLocalization("page_about", "about");
		addLocalization("page_options", "options");
		addLocalization("imageTimeLabel", "imageTimeLabel");
		addLocalization("imageTimeUnit", "imageTimeDescription");
		addLocalization("enableRatingViewLabel", "enableRatingViewLabel");
		addLocalization("enableRatingViewTrue", "enableRatingViewTrue");
		addLocalization("enableRatingViewFalse", "enableRatingViewFalse");
		addLocalization("showIconFlagLabel", "optionShowIconFlagLabel");
		addLocalization("showIconFlagYes", "yes");
		addLocalization("showIconFlagNo", "no");
		addLocalization("showIconFlagDesc", "optionShowIconFlagDesc");
		addLocalization("hideIconConfirmFlagLabel", "optionsHideIconConfirmFlagLabel");
		addLocalization("hideIconConfirmFlagFalse", "yes");
		addLocalization("hideIconConfirmFlagTrue", "no");
		addLocalization("optionsSaveMessage", "optionsSaveMessage");
		//feedback section
		addLocalization("page_feedback_", "feedbackPage", "innerHTML");
		//about section
		addLocalization("siteAboutHeadline", "siteAboutHeadline", "innerHTML");
		addLocalization("siteAboutWorksHeadline", "siteAboutWorksHeadline", "innerHTML");
		addLocalization("siteAboutWorksDesc", "siteAboutWorksDesc", "innerHTML");
		addLocalization("siteAboutFeaturesHeadline", "siteAboutFeaturesHeadline", "innerHTML");
		addLocalization("siteAboutFeaturesDesc", "siteAboutFeaturesDesc", "innerHTML");
		addLocalization("siteAboutCode", "siteAboutCode", "innerHTML");
	}
	/**
	 * @description Translate popup.html
	 */
	function translatePopupPage() {
		//popup.html page
		addLocalization("ytPreviewOptions", "popupOptions");
		addLocalization("ytPreviewHideIcon", "popupHideIcon");
		addLocalization("popupAboutHideIcon", "popupAboutHideIcon");
		addLocalization("areYouSureQuestion", "popupAreYouSureQuestion");
		addLocalization("hideIconOptionsYes", "yes", "value");
		addLocalization("hideIconOptionsNo", "no", "value");
		addLocalization("hideIconConfirmLabel", "popupHideIconConfirmLabel");
		addLocalization("hideIconOptionsInfoDesc", "popupHideIconOptionsInfoDesc");
		addLocalization("hideIconOptionsInfoPath", "popupHideIconOptionsInfoPath");
	}
	/**
	 * @description Execute translation
	 */
	function execute() {
		//general strings
		addLocalization("loading", "loading");
		translateSitePage();
		translatePopupPage();
	}
	//execute translation
	execute();
}());