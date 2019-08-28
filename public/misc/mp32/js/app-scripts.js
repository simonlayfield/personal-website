$(document).ready(function() {

  // Model dropdown filter

  $('#customDropdown1').on('change', function(e) {

    var selectedFilter = $(this).val();

    if (selectedFilter == "Show All") {

      $('.model__item').show();

    } else {

      $.each($('.model__item'), function(i, obj) {

        if ($(this).find('.model__title').text().indexOf(selectedFilter) >= 0) {
          $(this).show();
        } else {
          $(this).hide();
        }

      });

    }

    e.preventDefault();

  });

  // Window resize callback for fudging desktop summary
  (function($) {

    var $window = $(window),
      $html = $('html');

    $window.resize(function resize() {

      if ($window.width() < 860) {

        $('.planSummaryItem').removeClass('expanded');
        $('.planBody').hide();
        return $html.addClass('mobile');
      }

      $html.removeClass('mobile');
      $('.planBody').show();

    }).trigger('resize');

  })(jQuery);

  // Update device information in the home panel. This adds a validation notification.

  (function($) {

    var updateDevice = $('.update');

    var updateAnim = '<div class="updated"><span class="checkmarkWrap"><span class="checkmark"><div class="checkmark_circle ico ico-tick"></div></span></span></div>';

    updateDevice.click(function() {
      $('body').delay(800).queue(function(next) {
        $(this).append(updateAnim);
        next();
      });
      var modalVal = $(this).parent().parent().attr('id')
      setTimeout(function() {
        $('.updated').remove();
        $('#' + modalVal).foundation('reveal', 'close');
      }, 3000);

    });

  })(jQuery);

  // Real quick and dirty close of delete confirmation modal
  $('#deleteModal .button').click(function() {
    $(this).foundation('reveal', 'close');
  });

  // Generic show/hide toggle function (e.g. Model Config)

  // We only want this click event to fire on mobile
  $('.tap').on('click ontouchstart', function(e) {

    if (!$('html').hasClass('mobile')) {
      e.preventDefault();
      return false;
    }

    $this = $(this);

    if ($this.parent().find(".model__config-panel, .planBody").hasClass('on')) {

      $this.parent().find(".model__config-panel, .planBody").slideToggle().removeClass('on');
      $this.parent().find('.model__config span').toggleClass('ico-arrow-up');
      $this.parent().removeClass('expanded');

    } else {

      $(".model__config-panel.on, .planBody.on").slideToggle(300).removeClass('on');
      $(".planSummaryItem").removeClass('expanded');
      $this
        .parent()
        .find(".model__config-panel, .planBody")
        .stop(true, true)
        .slideToggle(300, function() {

          $("body, html").animate({

            scrollTop: $this.parent().offset().top

          }, 500, 'easeOutQuint');

        })
        .addClass('on');
      $this.parent().addClass('expanded');

      $this.parent().find('.model__config span').toggleClass('ico-arrow-up');

    }

  });

  // Switch active capacity when selection changes

  $('.capacityButton').click(function(e) {

    $('.capacityButton.active').removeClass('active');
    $(this).toggleClass('active');
    e.preventDefault();

  });

  // Position Summary Panel

  var summary = $('.summary');
  var summaryWidth;
  var summaryAnim;

  // Show summary function is run when device is selected

  function showSummary(element) {

    // First we need to know if we need to animate from the bottom or side (mobile or desktop)

    if (!$('html').hasClass('mobile')) {

      summaryWidth = summary.outerWidth();

      var summaryAnim = {
        right: '0px'
      };

      // Display the summary to the side of the window

      summary.css({
        'display': 'block',
        'position': 'fixed',
        'right': '-20%',
        'top': '0px'
      });

    } else {

      var summaryAnim = {
        bottom: '0px'
      };

      // Display the summary below the window

      summary.css({
        'display': 'block',
        'position': 'fixed',
        'bottom': '-300px'
      });

    }

    // Once displayed off screen, get combined summary top bar height

    var summaryHeight = summary.outerHeight();

    // Animate the window height - the summary top bar height
    $('body').addClass('summaryShown');

    summary.delay(800).animate(summaryAnim, 800, 'easeInOutElastic', function() {

      if (element.attr('data-group') === "handset") {

        var handsetValue = ['handset'];

        updateSummary(handsetValue);

      } else if (element.attr('data-group') === "sim") {

        var simValue = ['sim'];

        updateSummary(simValue);

      }

    });

  }

  // Set the first .view div as .visible on page load

  var views = $('.view');
  $(views[0]).addClass('visible');

  //  Close the handset config modal

  function closeModal(modalId) {

    $(modalId).foundation('reveal', 'close');

    $(document).one('closed.fndtn.reveal', modalId, function() {

      var modal = $(this);

      var buttonClicked = $(modalId).find('[data-step]');

      switchView(buttonClicked);


    });


  }

  // When an element with a data-step attribute is clicked,

  $('[data-step]').on('click', function(e) {

    // First (unfortunately) we have to close the handset modal

    if ($(this).attr('data-group') === 'handset') {

      var modalId = '#' + $(this).closest('.model__config-panel').attr('id');

      closeModal(modalId);

    } else {

      // To manage clickable child elements (should perhaps be managed with stopPropagation())

      if (e.target != this) {

        switchView($(this).closest('[data-step]'));

      } else {

        switchView($(e.target));

      }

      e.preventDefault();

    }

  });

  // Function from David Walsh: http://davidwalsh.name/css-animation-callback
  // To detect the end of a CSS animation

  function whichTransitionEvent() {
    var t,
      el = document.createElement("fakeelement");

    var transitions = {
      "animation": "animationend",
      "OAnimation": "oAnimationEnd",
      "MozAnimation": "animationend",
      "WebkitAnimation": "webkitAnimationEnd"
    }

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  var transitionEvent = whichTransitionEvent();

  // The brain. This function determines the next/previous views and positions and shows them accordingly.

  // Setup cycle iterations

  var cycleCount = 0;
  var currentCycle = 0;
  var currentStep = 1;
  var currentStepString = 'home';
  var cycleSteps = [currentStepString];

  function switchView(element) {

    // Get the element that was passed from the click function

    $this = element;

    if (currentStepString == 'home') {
      $('.view.home').removeClass('animated fadeInUp');
    }

    // Determine the next view that needs to be shown
    var nextStep = $this.attr('data-step');

    console.log(nextStep);

    if (cycleSteps.indexOf(nextStep) !== -1) {
      console.log('true');
      currentStep = 0;
      cycleSteps = [];
    }

    cycleSteps[currentStep] = nextStep;
    currentStep += 1;

    currentStepString = cycleSteps[cycleSteps.length - 1];

    // If we're in the first cycle we need to show the summary when a device is selected

    if (cycleCount == 0 && nextStep == 'home') {

      showSummary($this);

    }

    // CSS Animations

    $this.closest('.view').addClass('zipOutLeft');

    $('.' + nextStep).addClass('visible zipInRight');

    $('.zipOutLeft').one(transitionEvent,
      function(event) {

        // After animation ends, remove the classes

        $('.zipOutLeft').removeClass('visible zipOutLeft').css('position', 'absolute');
      });
    $("html, body").animate({
      scrollTop: 0
    }, "fast");
    $('.zipInRight').one(transitionEvent,
      function(event) {

        // After animation ends, remove the classes

        $('.zipInRight').removeClass('zipInRight').css('position', 'relative');

      });

    if (currentStepString == 'home') {

      // Once we've completed a cycle, hide the back button...

      $('.back-button').removeClass('animated fadeInHalfLeft').animate({
        left: '-50px'
      }, 500, 'easeInOutExpo');

      // Remove any .selected classes from the first cycle and hide expanded sections

      $('.planSelectButton').removeClass('selected');

      if ($('html').hasClass('mobile')) {

        $('.model__config-panel, .planBody ').removeClass('on').hide();
        $('.planSummaryItem.expanded').removeClass('expanded');

      }

      currentCycle += 1;
      cycleCount += 1;

      $('.view.home .checkout').show();
      $('.view.home .model__list').show();
      $('.view.home .home__intro').hide();

      $('.view.home .step__title').html('<span class="ico ico-home yellow"></span> Add more plans!');
      $('.view.home h3.product-select__title').html('ADD ANOTHER SERVICE');

      $('.view.home .model__item').each(function(i, el) {

        if (i < currentCycle) {

          $(el).css('display', 'block');

        }

      });

    } else if (currentStepString == 'terms' || currentStepString == 'whichsim') {

      // Hide the standard BACK button on plain text views

      $('.back-button').removeClass('animated fadeInHalfLeft').animate({
        left: '-50px'
      }, 500, 'easeInOutExpo');

    } else {

      $('.back-button').show().animate({
        left: '0.25em'
      }, 500, 'easeInOutExpo');

    }

    // Keep track of where we are by adding data-step to the global

  }

  // When Back button is clicked, cycle back to the previous view

  $('.back-button, .backtrack-button').on('click', function() {

    // Grab the preview view from the Array
    var targetStep = cycleSteps[cycleSteps.length - 2];

    console.log('was: ' + cycleSteps);

    prevStep = $('.view.' + targetStep);

    // Tell the visible view to animate out

    $('.visible').addClass('zipOutRight');

    // Tell the previous step to animate in

    prevStep.addClass('visible zipInLeft');

    // Once animations are done, remove the classes

    $('.zipOutRight').one('webkitAnimationEnd',
      function(e) {

        $('.zipOutRight').removeClass('visible zipOutRight').css('position', 'absolute');

      });

    $('.zipInLeft').one('webkitAnimationEnd',
      function(e) {

        $('.zipInLeft').removeClass('zipInLeft').css('position', 'relative');

      });

    // If we get back to the first view, hide the back button
    if (targetStep === 'home') {

      $(this).removeClass('animated fadeInHalfLeft').animate({
        left: '-50px'
      }, 500, 'easeInOutExpo');

    } else if (targetStep === 'plans') {

      $('.back-button').show().animate({
        left: '0.25em'
      }, 500, 'easeInOutExpo');

    }

    // As we've navigated back, remove an increment from currentStep and remove the last item from cycleSteps

    currentStep -= 1;
    cycleSteps.splice(-1, 1);

    console.log('now: ' + cycleSteps);

  });

  $('.value').on('click', function(e) {

    var $this = $(this);

    // If handset is selected, pass an array to update the summary cmp and device

    // if (!$this.hasClass('selected') && $this.attr('data-group') == "handset") {
    //
    //     var handsetValue = ['handset', parseInt($this.attr('data-val'))];
    //
    //     updateSummary(handsetValue);
    //
    //     $this.addClass('selected');
    //
    // } else

    if (!$this.hasClass('selected') && $this.attr('data-group') == "plan") {

      var planValue = ['plan', $this.attr('data-val')];

      updateSummary(planValue);

      $this.addClass('selected');

    }

    e.preventDefault();

  });

  function updateSummary(value) {

    // Get the current totals
    // Split the dollar value and setup the summary values

    var cpmTotal = $('#cpm-total').text();
    cpmTotal = cpmTotal.split('$');
    cpmTotal = parseInt(cpmTotal[1]);

    var gbTotal = parseFloat($('#gb-total').text().slice(0, -2));

    var deviceTotal = parseInt($('#device-total').text());

    // If we have navigated back a step (edit) we need to remove the value of the previously selected device/plan

    if (currentCycle < cycleCount) {

      // remove value

    }

    // If we've selected a handset...

    if (value[0] == 'handset' || value[0] == 'sim') {

      deviceTotal = cycleCount + 1;

      $('#device-total').html(deviceTotal)
        .addClass('animated swing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {

          $(this).html(deviceTotal).removeClass('animated swing');

        });

    }

    // If we've selected a plan
    else if (value[0] == 'plan') {

      // Update Summary Plan Data

      var planValue = value[1].split('-');

      gbTotal += parseFloat(planValue[0].slice(0, -2));

      $('#gb-total').html(gbTotal + 'GB')
        .addClass('animated swing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {

          $(this).removeClass('animated swing');

        });

      cpmTotal += parseInt(planValue[1]);

      $('#cpm-total').html('<sup>&#36;</sup>' + cpmTotal).addClass('animated swing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {

        $(this).removeClass('animated swing');

      });

      // Update Summary device cycleCount
      deviceTotal = cycleCount;

      $('#device-total').html(deviceTotal)
        .addClass('animated swing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {

          $(this).html(deviceTotal).removeClass('animated swing');

        });

    }

  }

});
