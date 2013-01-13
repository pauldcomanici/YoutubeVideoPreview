/**
 * @description DOM Helper
 */
var DyDomHelper = (function () {
    "use strict";
	/*global window, document */
	var my,
		publicMethods;
	my = {
		/**
		 * 
		 * @description Get Element style property
		 * @param {HTMLElement} el
		 * @param {String} propr
		 * @param {Boolean} asInt
		 * @returns {String}
		 */
		getElementCssProp: function (el, propr, asInt) {
			var cssProp;
			asInt = asInt || false;
			if (el && propr) {
				cssProp = window.getComputedStyle(el, "").getPropertyValue(propr);
				if (asInt) {
					cssProp = parseInt(cssProp, 10);
					if (isNaN(cssProp)) {
						cssProp = 0;
					}
				}
			}
			return cssProp;
		},
		/**
		 * 
		 * @description Set Element style property
		 * @param {HTMLElement} el
		 * @param {String} prop
		 * @param {String} val
		 */
		setElementStyle: function (el, prop, val) {
			el.style[prop] = val;
		},
		/**
		 * 
		 * @description Set Element style
		 * @param {HTMLElement} el
		 * @param {Object} styleObj
		 */
		setElementCss: function (el, styleObj) {
			var prop;
			styleObj = styleObj || {};
			for (prop in styleObj) {
				if (styleObj.hasOwnProperty(prop)) {
					my.setElementStyle(el, prop, styleObj[prop]);
				}
			}
		},
		/**
		 * 
		 * @description Set Element attributes
		 * @param {HTMLElement} el
		 * @param {Object} attrObj
		 */
		setElementAttr: function (el, attrObj) {
			var prop;
			for (prop in attrObj) {
				if (attrObj.hasOwnProperty(prop)) {
					el.setAttribute(prop, attrObj[prop]);
				}
			}
		},
		/**
		 * 
		 * @description Create element
		 * @param {String} elType
		 * @param {Object} elAttrs
		 * @param {Object} elStyle
		 * @returns {HTMLElement}
		 */
		createEl: function (elType, elAttrs, elStyle) {
			var el;
			elAttrs = elAttrs || {};
			elStyle = elStyle || {};
			if (elType) {
				el = document.createElement(elType);
				my.setElementAttr(el, elAttrs);
				my.setElementCss(el, elStyle);
			}
			return el;
		},
		/**
		 * 
		 * @description Test if element has provided css class
		 * @param {HTMLElement} el
		 * @param {String} className
		 * @returns {Boolean}
		 */
		hasClass: function (el, className) {
			var hasClass = false;
			if (el && className) {
				if (el.classList.contains(className)) {
					hasClass = true;
				}
			}
			return hasClass;
		},
		/**
		 * 
		 * @description Add css class to element
		 * @param {HTMLElement} el
		 * @param {String} className
		 */
		addClass: function (el, className) {
			if (el && className) {
				el.classList.add(className);
			}
		}
	};
    //set public methods
	publicMethods = {
		getCssProp: my.getElementCssProp,
		createEl: my.createEl,
		setAttr: my.setElementAttr,
	    setCss: my.setElementCss,
	    setStyle: my.setElementStyle,
	    hasClass: my.hasClass,
	    addClass: my.addClass
	};
	return publicMethods;
}());