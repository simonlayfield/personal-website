/*global window, Math, clearInterval, setInterval, clearTimeout, setTimeout*/

// @see https://github.com/umdjs/umd/blob/master/jqueryPlugin.js
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery', 'Hammer', 'modernizr'], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($, Hammer, Modernizr) {

	var $window = $(window);

	var Carousel = window.Carousel = function (carouselSelector, itemSelector) {

		this.element = $(carouselSelector);
		this.itemSelector = itemSelector;
		this.autoscrollIntervalId = null;
		this.currentPage = 0;

		// Keep track of classes here.
		this.cssClasses = {
			isOnPage: 'is-onPage',
			isDisabled: 'is-disabled',
			isActive: 'is-active'
		};

	};

	Carousel.prototype = {

		init: function () {

			// Shows the carousel.
			this.addClassToElem();

			// This may change based off filtering style actions.
			this.items = this.element.find(this.itemSelector);

			this.pageCount = this.getPageCount();

			this.createButtons();
			this.createPageIndicators();

			this.bindClickHandlers();
			this.bindResizeHandler();

			// Ensure buttons are hidden.
			this.showPage(0);

			// Add init class, for BDD testing.
			this.element.addClass('is-initialized');



		},

		/**
		 * An existing carousel has experienced a change which affects it.
		 * Get everything back in order.
		 * Can be: window resize event, or perhaps some other JS has changed the items inside (filtering).
		 */
		reInit: function () {

			// Items may have changed, so ensure we get them from the DOM again.
			this.items = this.element.find(this.itemSelector);

			this.pageCount = this.getPageCount();

			this.removePageIndicators();
			this.createPageIndicators();

			// If the number of items has been changed (say, by filtering), reset the page count to 0.
			this.showPage(0);

			this.disableButtonsIfNoFurtherPages();

		},


		getPageCount: function () {

			// Fix for issue when using padding on .carousel-itemOuterContainer (can't navigate to last item).
			var elementWidth = this.element.find('.carousel-itemOuterContainer').width();

			// Internet Explore cannot handle 0 value for Math. So need to return in this case
			// Returned Value of infinity breaking on page load
			if (elementWidth === 0) {
				return;
			}

			var itemWidth = this.items.outerWidth();

			var pageCount = (itemWidth / elementWidth) * this.items.length;

			if (pageCount < 1) {
				// This can occur when initializing a Carousel that is not displayed at the start.
				// E.g. mobile carousel that's hidden via foundation classes.
				return 1;
			}

			// Round off values which are slightly off due to browser pixel rounding.
			return Math.ceil(Math.floor(pageCount * 10) / 10);

		},

		addClassToElem: function () {
			this.element.addClass('is-carousel');
		},

		createButtons: function () {
			this.previousButton = this.createButton(
				'carousel-button-previous',
				'<span class="ico ico-arrow-left"></span>'
			);
			this.nextButton = this.createButton(
				'carousel-button-next',
				'<span class="ico ico-arrow-right"></span>'
			);
		},

		createButton: function (cssClass, content) {
			var buttonHtml = '<div class="carousel-button ' + cssClass + '" type="button">' +
				content +
				'</div>';

			return $(buttonHtml).appendTo(this.element);
		},

		/**
		 * The wrapper is for absolute positioning, centered positioning etc.
		 */
		createPageIndicators: function () {

			var wrapperHtml = '<div class="carousel-pageIndicatorsWrapper"></div>';
			var containerHtml = '<div class="carousel-pageIndicatorsContainer"></div>';
			var pageIndicatorHtml = '<div class="carousel-pageIndicator"></div>';

			this.pageIndicatorsWrapper = $(wrapperHtml).appendTo(this.element);
			this.pageIndicatorsContainer = $(containerHtml).appendTo(this.pageIndicatorsWrapper);

			for (var i = 0; i < this.pageCount; i++) {
				this.pageIndicatorsContainer.append(pageIndicatorHtml);
			}

		},

		removePageIndicators: function () {
			this.pageIndicatorsWrapper.remove();
			this.pageIndicatorsContainer.remove();
		},

		updatePageIndicators: function () {

			this.pageIndicatorsContainer.children()
				.removeClass(this.cssClasses.isActive)
				.eq(this.currentPage)
				.addClass(this.cssClasses.isActive);

		},

		showPreviousPage: function (event) {
			event.preventDefault();
			this.showPage(this.currentPage - 1);
		},

		showNextPage: function (event) {
			event.preventDefault();
			this.showPage(this.currentPage + 1);
		},

		showPage: function (pageNumber) {

			if (!this.isValidPageNumber(pageNumber)) {
				// Past bounds, abort (OR - carousel got into incorrect state due to bug).
				return;
			}

			this.currentPage = pageNumber;
			this.addClassToDisplayCurrentPage();
			this.disableButtonsIfNoFurtherPages();
			this.updatePageIndicators();

			// Reset autoscroll
			if (this.element.is('.carousel-hero')) {
				this.autoscroll();
			}

		},

		isValidPageNumber: function (pageNumber) {
			return pageNumber >= 0 && pageNumber < this.pageCount;
		},

		/**
		 * Strip out all the "is-onPageX" numbered classes, then add the one we want.
		 */
		addClassToDisplayCurrentPage: function () {

			this.element.attr('class', function (index, cssValue) {
				// Remove is-onPageX, where X is a pre-generated set of numbers we don't know the limit to.
				return cssValue.replace(new RegExp(this.cssClasses.isOnPage + '\\d+', 'g'), '');
			}.bind(this));

			this.element.addClass(this.cssClasses.isOnPage + this.currentPage);

		},

		showButtons: function () {
			this.previousButton.removeClass(this.cssClasses.isDisabled);
			this.nextButton.removeClass(this.cssClasses.isDisabled);
		},

		hideButtons: function () {
			this.previousButton.addClass(this.cssClasses.isDisabled);
			this.nextButton.addClass(this.cssClasses.isDisabled);
		},

		disableButtonsIfNoFurtherPages: function () {

			// Edge case - hide buttons if all items are removed (filtering).
			if (this.items.length === 0) {
				this.hideButtons();
				return;
			}

			this.showButtons();

			if (this.currentPageIsFirstPage()) {
				this.previousButton.addClass(this.cssClasses.isDisabled);
			}

			if (this.currentPageIsLastPage()) {
				this.nextButton.addClass(this.cssClasses.isDisabled);
			}
		},

		currentPageIsFirstPage: function () {
			return this.currentPage === 0;
		},

		currentPageIsLastPage: function () {
			return this.currentPage === this.pageCount - 1;
		},

		bindClickHandlers: function () {

			// Next/Previous buttons
			this.previousButton.on('click', $.proxy(this.showPreviousPage, this));
			this.nextButton.on('click', $.proxy(this.showNextPage, this));

			// Page indicators
			var self = this;
			this.pageIndicatorsContainer.on('click', '.carousel-pageIndicator', function () {
				var $elem = $(this); // We need 'this' for the button, so no proxy.
				// TODO Should we check for is-active and do nothing? What about autoscroll?
				var pageIndex = $elem.index();
				self.showPage(pageIndex);
			});

		},

		/**
		 * SM 20Mar13: Rewrite with a timeout, for IE8 performnce issues. Not definitive.
		 */
		bindResizeHandler: function () {

			var self = this;
			var resizeTimer = null;

			$window.on('resize', function () {

				clearTimeout(resizeTimer);

				resizeTimer = setTimeout(function () {
					// Setup the carousel again to work with the changed viewport size.
					self.reInit();
				}, 200); // SM 20Mar13: 100ms is too fast for IE8 I think.

			});

		},

		/**
		 * SM 06May13: clearInterval allows autoscroll to be called to "reset" the delay.
		 * Used by page indicator clicks.
		 */
		autoscroll: function () {
			clearInterval(this.autoscrollIntervalId);
			this.autoscrollIntervalId = setInterval($.proxy(this.doAutoscroll, this), 8000);
		},

		doAutoscroll: function () {
			if (this.currentPageIsLastPage()) {
				this.showPage(0);
			} else {
				this.showNextPage();
			}
		}

	};

	/**
	 * SM 20Mar13: Moved in from initCarousel.js.
	 */
	$(document).bind('ready jsContentLoaded', function (e) {

		// Define the container element
		var $target = $(e.target);

		$target.find('.carousel').each(function (index, element) {

			// Only setup once. Idempotence.
			// TODO Should we re-initialize instead? Wait for the Story, then implement.
			if ($(element).data('carouselObj')) {
				// reInit to handle changed amounts of carousel items.
				var carouselObj = $(element).data('carouselObj');
				carouselObj.reInit();
				return;
			}

			var carouselObj = new Carousel(element, '.carousel-item');

			carouselObj.init();

			window.carouselObj = carouselObj;

			if (carouselObj.element.is('.carousel-hero')) {
				carouselObj.autoscroll();
			}
			// SM 14May13: Loose integration of swipe events into carousels.
			// Note the swipe direction is counter-intuitive (at least for me).
			Hammer = Hammer || window.Hammer;
			var hammer = new Hammer(element);
			hammer
				.on('swipeleft', function (event) {
					carouselObj.showNextPage(event);
				})
				.on('swiperight', function (event) {
					carouselObj.showPreviousPage(event);
				});


			// Store Carousel object instance in the element using jQuery data API.
			$(element).data('carouselObj', carouselObj);


		});

	});

}));
