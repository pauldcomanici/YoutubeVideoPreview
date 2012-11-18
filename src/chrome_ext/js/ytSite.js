/**
 * 
 * @description JavaScript logic for extension site
 */
(function () {
	"use strict";
	/*global chrome, document, window*/
	var my = {
		pageName: "",
		oldPageName: "",
		titleSelection: {},
		pageLinks: [],
		pageLinksLength: 0,
		/**
		 * 
		 * @description Initialize class members
		 */
		initializeMembers: function initializeMembers() {
			my.oldPageName = "";
			my.titleSection = {
				about: chrome.i18n.getMessage("about"),
				options: chrome.i18n.getMessage("options"),
				feedback: chrome.i18n.getMessage("feedback")
			};
		},
		/**
		 * 
		 * @description Update page title
		 */
		updatePageTitle: function updatePageTitle() {
			document.querySelector("#pageHeader .headerTitleSection").textContent = my.titleSection[my.pageName];
		},
		/**
		 * @description Set page name
		 */
		setPageName: function setPageName(newPageName) {
			my.pageName = newPageName;
		},
		/**
		 * 
		 * @description Retrieve site page
		 * @param {String} locationHash
		 */
		retrievePage: function retrievePage(locationHash) {
			locationHash = locationHash || window.location.hash;
			if (locationHash.length > 0) {
				locationHash = locationHash.replace("#", "");
			} else {
				locationHash = "options";
			}
			my.setPageName(locationHash);
		},
		/**
		 * 
		 * @description Set selected page from menu
		 */
		setSelectedPage: function setSelectedPage() {
			var linkIndex,
				linkId;
			if (my.oldPageName !== my.pageName) {
				for (linkIndex = 0; linkIndex < my.pageLinksLength; linkIndex = linkIndex + 1) {
					linkId = my.pageLinks[linkIndex].getAttribute("id");
					if (linkId === "page_" + my.pageName) {
						my.pageLinks[linkIndex].classList.add("selected");
						document.getElementById(linkId + "_").removeAttribute("hidden");
					} else if (linkId === "page_" + my.oldPageName) {
						my.pageLinks[linkIndex].classList.remove("selected");
						document.getElementById("page_" + my.oldPageName + "_").setAttribute("hidden", true);
					}
				}
				my.oldPageName = my.pageName;
				my.updatePageTitle();
			}
		},
		/**
		 * 
		 * @description Function executed when you click on a menu item
		 * @param {Event} evt
		 */
		onClickMenu: function onClickMenu(evt) {
			var linkEl,
				locationHash;
			linkEl = evt.target;
			locationHash = linkEl.getAttribute("href");
			my.retrievePage(locationHash);
			my.setSelectedPage();
			//evt.preventDefault();
		},
		/**
		 * 
		 * @description Attach events on page
		 */
		delegate: function delegate() {
			var linkIndex;
			my.pageLinks = document.querySelectorAll("#pageNavigation a");
			my.pageLinksLength = my.pageLinks.length;
			for (linkIndex = 0; linkIndex < my.pageLinksLength; linkIndex = linkIndex + 1) {
				my.pageLinks[linkIndex].addEventListener("click", my.onClickMenu, false);
			}
		},
		/**
		 * 
		 * @description Initialize class
		 */
		init: function init() {
			my.initializeMembers();
			my.delegate();
			my.retrievePage();
			my.setSelectedPage();
		}
	};
	my.init();
}());