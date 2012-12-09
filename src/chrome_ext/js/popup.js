/**
 * 
 * @description Logic for popup page
 */
(function () {
    "use strict";
	/*global window, document, chrome, YtSettings, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM */
	var my = {
		hidePageActionConfirm: false,
		/**
		 * 
		 * @description Executed when user clicks option
		 */
		optionsClick: function () {
			chrome.extension.sendMessage("openOptions");
		},
		/**
		 * 
		 * @description Executed when user clicks hide icon
		 */
		hidePopupClick: function () {
			var popupMainEl,
				hideIconContainerEl;
			if (my.hidePageActionConfirm) {
				//user didn't checked "Do not ask next time"
				popupMainEl = document.getElementById("popupMain");
				popupMainEl.setAttribute("hidden", true);
				hideIconContainerEl = document.getElementById("removePageAction");
				hideIconContainerEl.removeAttribute("hidden");
			} else {
				//user checked "Do not ask next time"
				my.hidePopupYesClick();
			}
		},
		/**
		 * 
		 * @description Executed when user clicks Yes button
		 */
		hidePopupYesClick: function () {
			YtSettings.setPropr(PROPR_SHOW_ICON, false);
			YtSettings.setPropr(PROPR_HIDE_ICON_CONFIRM, my.hidePageActionConfirm);
			window.close();
		},
		/**
		 * 
		 * @description Executed when user clicks No button
		 */
		hidePopupNoClick: function () {
			window.close();
		},
		/**
		 * 
		 * @description Executed when user clicks No button
		 */
		hideIconConfirmClick: function () {
			my.hidePageActionConfirm = !my.hidePageActionConfirm;
		},
		/**
		 * 
		 * @description Attach events
		 */
		delegate: function () {
			var optionsEl,
				hideIconEl,
				hideIconYesEl,
				hideIconNoEl,
				hideIconConfirmEl;
			optionsEl = document.getElementById("ytPreviewOptions");
			optionsEl.addEventListener("click", my.optionsClick, false);
			hideIconEl = document.getElementById("ytPreviewHideIcon");
			hideIconEl.addEventListener("click", my.hidePopupClick, false);
			hideIconYesEl = document.getElementById("hideIconOptionsYes");
			hideIconYesEl.addEventListener("click", my.hidePopupYesClick, false);
			hideIconNoEl = document.getElementById("hideIconOptionsNo");
			hideIconNoEl.addEventListener("click", my.hidePopupNoClick, false);
			hideIconConfirmEl = document.getElementById("hideIconConfirmCheckbox");
			hideIconConfirmEl.addEventListener("click", my.hideIconConfirmClick, false);
		},
		/**
		 * 
		 * @description Initialize
		 */
		init: function () {
			var hideIconConfirmEl;
			my.hidePageActionConfirm = YtSettings.getPropr(PROPR_HIDE_ICON_CONFIRM);
			hideIconConfirmEl = document.getElementById("hideIconConfirmCheckbox");
			if (!my.hidePageActionConfirm) {
				hideIconConfirmEl.setAttribute("checked", true);
			}
			my.delegate();
		}
	};
	my.init();
}());