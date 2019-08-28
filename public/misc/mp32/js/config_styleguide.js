require.config({
    baseUrl: 'static/assets/javascripts/source/vendors',
    paths: {
        jquery: 'jquery',
        waypoints: 'waypoints.min',
        greensock: 'greensock/TweenMax.min'
    },
    shim: {
        "foundation/foundation" : { deps: ["jquery"] },
        "foundation/foundation.alerts": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.clearing": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.cookie": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.dropdown": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.forms": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.joyride": { deps: ["jquery", "foundation"] },
        "foundation/foundation.magellan": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.orbit": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.placeholder": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.reveal": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.section": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.tooltips": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.topbar": { deps: ["jquery", "foundation/foundation"] },
        "foundation/foundation.interchange": { deps: ["jquery", "foundation/foundation"] },
        "jquery.scrollTo-1.4.3.1-min": { deps: ["jquery"] },
        "jquery.easing.1.3": { deps: ["jquery"] }
    }
});