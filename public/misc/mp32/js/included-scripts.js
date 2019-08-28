


// BELOW ARE THE INCLUDED SCRIPTS ON THE STYLE GUIDE PAGES

			function hexc(colorval) {
			    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			    delete(parts[0]);
			    for (var i = 1; i <= 3; ++i) {
			        parts[i] = parseInt(parts[i]).toString(16);
			        if (parts[i].length == 1) parts[i] = '0' + parts[i];
			    }
			    color = '#' + parts.join('').toUpperCase();

			    return color;
			}
			$(document).ready(function() {
				$('.colour-block').each(function(){
					var bgColour = $(this).css('background-color'),
						$colourCode = $(this).next().find('.colour-code');

					$colourCode.text(hexc(bgColour));
				});
				$('.colour-block-top').each(function(){
					var bgColour = $(this).css('background-color'),
						$colourCode = $(this).prev().find('.colour-code');

					$colourCode.text(hexc(bgColour));
				});
				// Handle prevent the default behaviour of the accordion
				$("#exampleForm .section-container .title a").click(function(evt){
					evt.preventDefault();
					return false;
				});
				$("#exampleForm .section-container.accordion .active .title a").css("cursor","default");
				$("#exampleForm").submit();
			});

		
		//	Allow the style guide to post-compile handlebar templates
		//	Usage: <div data-hbs-template="" data-hbs-model=""></div>
		
			$(document).ready(function(){
				$('div[data-hbs-template]').each(function(){
					var templateUrl = $(this).data("hbsTemplate"),
						modelUrl = $(this).data('hbsModel'),
						container = $(this);

					if (!templateUrl || !modelUrl) {
						return false;
					}

					$.get(templateUrl, function(source) {
						$.get(modelUrl, function(model) {
							var template = Handlebars.compile(source);
							container.html(template(model));			
						});
					});

				});
			});
		
		




			var optus = optus || {};
			optus.tools = optus.tools || {};

		    (function(module, $, undefined) {
		        "use strict";

		        module.start = function() {
		            //autocomplete
		            $('input.autocomplete').on('keyup', function() {
		                $(this).parent().find('.autocomplete-suggestive-text').addClass('active');
		            }).on('blur', function(){
		                $(this).parent().find('.autocomplete-suggestive-text').removeClass('active');
		            });
		        };

		    })(optus.tools.autocomplete = optus.tools.autocomplete || {}, jQuery);

		    (function(module, $, undefined) {
		        "use strict";

		        module.start = function() {
		            //clearable input script
		            $('<span class="ico clear-input"></span>').insertAfter('input.clearable-input');
		            $('input.clearable-input').on('focusin', function(){
		            $(this).next('.clear-input').addClass('show');
		            }).on('focusout', function(){
		            $(this).next('.clear-input').removeClass('show');
		            });
		        };

		    })(optus.tools.clearableInput = optus.tools.clearableInput || {}, jQuery);

		    (function(module, $, undefined) {
		        "use strict";

		        module.start = function() {

		          // Responsive tables inject a .table-wrapper div, a .pinned div and a table within the .pnned div.
		          // This results in 2 tables being in the page.
		          // Selectable tables require both tables rows to change colour on hover, and clicking a row reveals a button

		          // Selectable table functionality.
		          // Add a class to that was clicked, which is used to display a hidden button
		          
		          $(".is-selectable tr").click(function(event){
		              $(this).parent().find('tr').removeClass('is-selected');   // Removes selected out of all rows
		              $(this).addClass("is-selected");
		          });
		        };

		    })(window.optus.tools.selectableResponsiveTable = window.optus.tools.selectableResponsiveTable || {}, jQuery);


			// Selectable table column
			(function(module, $, undefined) {
				"use strict";

				module.start = function() {

					// ---------------------------------------------------------------------------------
					// Set pre selected plan checkbox to checked
					// On page load Foundation resets the form checkboxes to unchecked so the code
					// below is called after Foundation set the correct values
					// ---------------------------------------------------------------------------------

					// Get the checkbox labels from the HTML data attribute
					var checkboxDefaultText = $("span[data-checkbox-default]").data("checkbox-default");
					var checkboxSelectedText = $("span[data-checkbox-selected]").data("checkbox-selected");

					// Setup the checkbox default and selected selectors
					var checkboxDefault = $(".is-selectable-by-column span[data-checkbox-default]");
					var checkboxSelected = $(".is-selectable-by-column .is-selected span[data-checkbox-default]");

					// Set the default checkbox label
					checkboxDefault.html(checkboxDefaultText);

					// Set the selected checkbox label
					checkboxSelected.html(checkboxSelectedText).addClass('checked');

					/// Set the selected checkbox to checked
					$(".is-selectable-by-column .is-selected span.custom.checkbox").addClass('checked');

					// Add class to column group for hover effect
					$(".is-selectable-by-column td:not([colspan]), .is-selectable-by-column th:not(:first-child)").hover(function() {
						$(this).parents('table').find('th:nth-child(' + ($(this).index() + 1) + ')').addClass('cell-hover');
						$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').addClass('cell-hover');
					},
					function() {
						$(this).parents('table').find('th:nth-child(' + ($(this).index() + 1) + ')').removeClass('cell-hover');
						$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').removeClass('cell-hover');
					});

					// Add class to column group for click event
					$(".is-selectable-by-column td:not([colspan]), .is-selectable-by-column th:not(:first-child)").on('click', function(e) {
						e.preventDefault();
						

						// Reset the previously selected column and checkbox
						$(".is-selectable-by-column th").removeClass('is-selected');
						$(".is-selectable-by-column td").removeClass('is-selected');
						$(".is-selectable-by-column span.custom.radio").removeClass('checked');
						checkboxDefault.html(checkboxDefaultText).removeClass('checked');

						// Set the new selected column and checkbox
						$(this).parents('table').find('th:nth-child(' + ($(this).index() + 1) + ')').addClass('is-selected');
						$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').addClass('is-selected');
						$(".is-selectable-by-column .is-selected span.custom.radio").addClass('checked');
						var checkboxSelected = $(".is-selectable-by-column .is-selected span[data-checkbox-default]");
						checkboxSelected.html(checkboxSelectedText).addClass('checked');
					});
				};

			})(optus.tools.selectableTableColumn = optus.tools.selectableTableColumn || {}, jQuery);


			// Selectable accordion
			(function(module, $, undefined) {
				"use strict";

				module.start = function() {

					// ---------------------------------------------------------------------------------
					// Sets the checkbox labels on Accordion
					// On page load Foundation resets the form checkboxes to unchecked so the code
					// below is called after Foundation set the correct values
					// ---------------------------------------------------------------------------------

					// Get the checkbox labels from the HTML data attribute
					var checkboxDefaultText = $("span[data-checkbox-default]").data("checkbox-default");
					var checkboxSelectedText = $("span[data-checkbox-selected]").data("checkbox-selected");

					// Setup the checkbox default selector
					var checkboxDefault = $(".is-selectable-accordion span[data-checkbox-default]");

					// Set the default checkbox label
					checkboxDefault.html(checkboxDefaultText);

					// Add class to selected for click event
					$(".is-selectable-accordion .pricing-preview label").on('click', function(e) {
						e.preventDefault();


						// Reset the previously selected checkbox
						$(".is-selectable-accordion .pricing-preview").removeClass('is-selected');
						$(".is-selectable-accordion span.custom.radio").removeClass('checked');
						checkboxDefault.html(checkboxDefaultText).removeClass('checked');

						// Set the new selected column and checkbox
						var domparent = $(this).parent().parent().parent(); 
						$(domparent).addClass('is-selected');
					//	$(this).addClass('is-selected');
						$(".is-selectable-accordion .is-selected span.custom.radio").addClass('checked');
						var checkboxSelected = $(".is-selectable-accordion .is-selected span[data-checkbox-default]");
						checkboxSelected.html(checkboxSelectedText).addClass('checked');
					});
				};

			})(optus.tools.selectableAccordion = optus.tools.selectableAccordion || {}, jQuery);


			// Animate anchor scroll
			(function(module, $, undefined) {
				"use strict";

				module.start = function() {

					// ---------------------------------------------------------------------------------
					// This script provides a smooth scroll effect between the plans table and the 
					// phone product grid
					// ---------------------------------------------------------------------------------

					$(function() {
						$('a[href=#phone-listing], a[href=#plan-phone-table], a[href=#plan-phone-accordion]').click(function() {
							if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
								var target = $(this.hash);
								target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
								if (target.length) {
									$('html,body').animate({
										scrollTop: target.offset().top
									}, 1000);
									return false;
								}
							}
						});
					});
				};

			})(optus.tools.animateAnchorScroll = optus.tools.animateAnchorScroll || {}, jQuery);


			$(function() {
				$(document).foundation();
				$(document).foundation('interchange', {
					named_queries : {
						'default' : 'only screen and (min-width: 1px)',
						small : 'only screen and (min-width: 500px)',
						medium : 'only screen and (min-width: 860px)',
						large : 'only screen and (min-width: 1024px)',
						fullscreen : 'only screen and (min-width: 1200px)'
					}
				});
				

				optus.tools.autocomplete.start();
				optus.tools.clearableInput.start();
				window.optus.tools.selectableResponsiveTable.start();
				optus.tools.selectableTableColumn.start();
				optus.tools.selectableAccordion.start();
				optus.tools.animateAnchorScroll.start();


				$('span.joyride-trigger').on("click", function() {
			  		$(document).foundation('joyride', 'start');
				});

			});

			// support the step accordion functionality for the purpose of demonstration only
			$(function() {
				$('.step-container .title').on('click', function(e)  {
					e.stopPropagation();
				});

				$('.step-container .stepNextButton').on('click', function(e)  {
					e.preventDefault();

					// reset the current section
					var $section = $('.step-container section.active');
					$section.removeClass('active');
					$section.find('.content').hide();
					// activate the next section
					$section = $($('.step-container section')[$(this).data('index')]);
					$section.removeClass('disabled');
					$section.addClass('active');
					$section.find('.content').show();
				});

				$('.step-container .step-edit').on('click', function(e)  {
					e.preventDefault();

					var $section = $(this).closest('section');
					// reset as this could be after a review
					$('.step-container section').addClass('editable');
					$('.step-container section .content').hide();
					$('.step-container section .content input').attr('disabled', false);
					$('.step-container section .content .stepNextButton').show();
					// remove the active section
					$('.step-container section.active').removeClass('active');
					// disable any section after this one
					$section.nextAll().addClass('disabled');
					// activate this section
					$section.addClass('active');
					$section.find('.content').show();
				});

				$('.step-container .stepReviewButton').on('click', function(e)  {
					e.preventDefault();

					// show all sections with disabled fields and no buttons
					$('.step-container section').removeClass('disabled');
					$('.step-container section').removeClass('editable');
					$('.step-container section .content').show();
					$('.step-container section .content input').attr('disabled', true);
					$('.step-container section .content .stepNextButton').hide();
				})
			});


