(function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function noop() {}

  function assign(tar, src) {
  	for (var k in src) {
  		tar[k] = src[k];
  	}return tar;
  }

  function appendNode(node, target) {
  	target.appendChild(node);
  }

  function insertNode(node, target, anchor) {
  	target.insertBefore(node, anchor);
  }

  function detachNode(node) {
  	node.parentNode.removeChild(node);
  }

  function reinsertChildren(parent, target) {
  	while (parent.firstChild) {
  		target.appendChild(parent.firstChild);
  	}
  }

  function destroyEach(iterations) {
  	for (var i = 0; i < iterations.length; i += 1) {
  		if (iterations[i]) iterations[i].d();
  	}
  }

  function createFragment() {
  	return document.createDocumentFragment();
  }

  function createElement(name) {
  	return document.createElement(name);
  }

  function createText(data) {
  	return document.createTextNode(data);
  }

  function createComment() {
  	return document.createComment('');
  }

  function addListener(node, event, handler) {
  	node.addEventListener(event, handler, false);
  }

  function removeListener(node, event, handler) {
  	node.removeEventListener(event, handler, false);
  }

  function linear(t) {
  	return t;
  }

  function generateRule(a, b, delta, duration, ease, fn) {
  	var keyframes = '{\n';

  	for (var p = 0; p <= 1; p += 16.666 / duration) {
  		var t = a + delta * ease(p);
  		keyframes += p * 100 + '%{' + fn(t) + '}\n';
  	}

  	return keyframes + '100% {' + fn(b) + '}\n}';
  }

  // https://github.com/darkskyapp/string-hash/blob/master/index.js
  function hash(str) {
  	var hash = 5381;
  	var i = str.length;

  	while (i--) {
  		hash = (hash << 5) - hash ^ str.charCodeAt(i);
  	}return hash >>> 0;
  }

  function wrapTransition(component, node, fn, params, intro, outgroup) {
  	var obj = fn(node, params);
  	var duration = obj.duration || 300;
  	var ease = obj.easing || linear;
  	var cssText;

  	// TODO share <style> tag between all transitions?
  	if (obj.css && !transitionManager.stylesheet) {
  		var style = createElement('style');
  		document.head.appendChild(style);
  		transitionManager.stylesheet = style.sheet;
  	}

  	if (intro) {
  		if (obj.css && obj.delay) {
  			cssText = node.style.cssText;
  			node.style.cssText += obj.css(0);
  		}

  		if (obj.tick) obj.tick(0);
  	}

  	return {
  		t: intro ? 0 : 1,
  		running: false,
  		program: null,
  		pending: null,
  		run: function run(intro, callback) {
  			var program = {
  				start: window.performance.now() + (obj.delay || 0),
  				intro: intro,
  				callback: callback
  			};

  			if (obj.delay) {
  				this.pending = program;
  			} else {
  				this.start(program);
  			}

  			if (!this.running) {
  				this.running = true;
  				transitionManager.add(this);
  			}
  		},
  		start: function start(program) {
  			component.fire(program.intro ? 'intro.start' : 'outro.start', { node: node });

  			program.a = this.t;
  			program.b = program.intro ? 1 : 0;
  			program.delta = program.b - program.a;
  			program.duration = duration * Math.abs(program.b - program.a);
  			program.end = program.start + program.duration;

  			if (obj.css) {
  				if (obj.delay) node.style.cssText = cssText;

  				program.rule = generateRule(program.a, program.b, program.delta, program.duration, ease, obj.css);

  				transitionManager.addRule(program.rule, program.name = '__svelte_' + hash(program.rule));

  				node.style.animation = (node.style.animation || '').split(', ').filter(function (anim) {
  					// when introing, discard old animations if there are any
  					return anim && (program.delta < 0 || !/__svelte/.test(anim));
  				}).concat(program.name + ' ' + program.duration + 'ms linear 1 forwards').join(', ');
  			}

  			this.program = program;
  			this.pending = null;
  		},
  		update: function update(now) {
  			var program = this.program;
  			if (!program) return;

  			var p = now - program.start;
  			this.t = program.a + program.delta * ease(p / program.duration);
  			if (obj.tick) obj.tick(this.t);
  		},
  		done: function done() {
  			var program = this.program;
  			this.t = program.b;
  			if (obj.tick) obj.tick(this.t);
  			if (obj.css) transitionManager.deleteRule(node, program.name);
  			program.callback();
  			program = null;
  			this.running = !!this.pending;
  		},
  		abort: function abort() {
  			if (obj.tick) obj.tick(1);
  			if (obj.css) transitionManager.deleteRule(node, this.program.name);
  			this.program = this.pending = null;
  			this.running = false;
  		}
  	};
  }

  var transitionManager = {
  	running: false,
  	transitions: [],
  	bound: null,
  	stylesheet: null,
  	activeRules: {},

  	add: function add(transition) {
  		this.transitions.push(transition);

  		if (!this.running) {
  			this.running = true;
  			requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
  		}
  	},

  	addRule: function addRule(rule, name) {
  		if (!this.activeRules[name]) {
  			this.activeRules[name] = true;
  			this.stylesheet.insertRule('@keyframes ' + name + ' ' + rule, this.stylesheet.cssRules.length);
  		}
  	},

  	next: function next() {
  		this.running = false;

  		var now = window.performance.now();
  		var i = this.transitions.length;

  		while (i--) {
  			var transition = this.transitions[i];

  			if (transition.program && now >= transition.program.end) {
  				transition.done();
  			}

  			if (transition.pending && now >= transition.pending.start) {
  				transition.start(transition.pending);
  			}

  			if (transition.running) {
  				transition.update(now);
  				this.running = true;
  			} else if (!transition.pending) {
  				this.transitions.splice(i, 1);
  			}
  		}

  		if (this.running) {
  			requestAnimationFrame(this.bound);
  		} else if (this.stylesheet) {
  			var i = this.stylesheet.cssRules.length;
  			while (i--) {
  				this.stylesheet.deleteRule(i);
  			}this.activeRules = {};
  		}
  	},

  	deleteRule: function deleteRule(node, name) {
  		node.style.animation = node.style.animation.split(', ').filter(function (anim) {
  			return anim.indexOf(name) === -1;
  		}).join(', ');
  	}
  };

  function blankObject() {
  	return Object.create(null);
  }

  function destroy(detach) {
  	this.destroy = noop;
  	this.fire('destroy');
  	this.set = this.get = noop;

  	if (detach !== false) this._fragment.u();
  	this._fragment.d();
  	this._fragment = this._state = null;
  }

  function _differs(a, b) {
  	return a != a ? b == b : a !== b || a && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' || typeof a === 'function';
  }

  function fire(eventName, data) {
  	var handlers = eventName in this._handlers && this._handlers[eventName].slice();
  	if (!handlers) return;

  	for (var i = 0; i < handlers.length; i += 1) {
  		var handler = handlers[i];

  		if (!handler.__calling) {
  			handler.__calling = true;
  			handler.call(this, data);
  			handler.__calling = false;
  		}
  	}
  }

  function get$1(key) {
  	return key ? this._state[key] : this._state;
  }

  function init(component, options) {
  	component._handlers = blankObject();
  	component._bind = options._bind;

  	component.options = options;
  	component.root = options.root || component;
  	component.store = component.root.store || options.store;
  }

  function observe(key, callback, options) {
  	var fn = callback.bind(this);

  	if (!options || options.init !== false) {
  		fn(this.get()[key], undefined);
  	}

  	return this.on(options && options.defer ? 'update' : 'state', function (event) {
  		if (event.changed[key]) fn(event.current[key], event.previous && event.previous[key]);
  	});
  }

  function on(eventName, handler) {
  	if (eventName === 'teardown') return this.on('destroy', handler);

  	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
  	handlers.push(handler);

  	return {
  		cancel: function cancel() {
  			var index = handlers.indexOf(handler);
  			if (~index) handlers.splice(index, 1);
  		}
  	};
  }

  function set$1(newState) {
  	this._set(assign({}, newState));
  	if (this.root._lock) return;
  	this.root._lock = true;
  	callAll(this.root._beforecreate);
  	callAll(this.root._oncreate);
  	callAll(this.root._aftercreate);
  	this.root._lock = false;
  }

  function _set(newState) {
  	var oldState = this._state,
  	    changed = {},
  	    dirty = false;

  	for (var key in newState) {
  		if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
  	}
  	if (!dirty) return;

  	this._state = assign(assign({}, oldState), newState);
  	this._recompute(changed, this._state);
  	if (this._bind) this._bind(changed, this._state);

  	if (this._fragment) {
  		this.fire("state", { changed: changed, current: this._state, previous: oldState });
  		this._fragment.p(changed, this._state);
  		this.fire("update", { changed: changed, current: this._state, previous: oldState });
  	}
  }

  function callAll(fns) {
  	while (fns && fns.length) {
  		fns.shift()();
  	}
  }

  function _mount(target, anchor) {
  	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
  }

  function _unmount() {
  	if (this._fragment) this._fragment.u();
  }

  function isPromise(value) {
  	return value && typeof value.then === 'function';
  }

  var proto = {
  	destroy: destroy,
  	get: get$1,
  	fire: fire,
  	observe: observe,
  	on: on,
  	set: set$1,
  	teardown: destroy,
  	_recompute: noop,
  	_set: _set,
  	_mount: _mount,
  	_unmount: _unmount,
  	_differs: _differs
  };

  var arrayNotationPattern = /\[\s*(\d+)\s*\]/g;
  function makeArrayMethod(name) {
      return function (keypath) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
          }
          var parts = keypath.replace(arrayNotationPattern, '.$1').split('.');
          var key = parts.shift();
          var value = this.get(key);
          var array = value;
          while (parts.length) {
              array = array[parts.shift()];
          }var result = array[name].apply(array, args);
          this.set((_a = {}, _a[key] = value, _a));
          return result;
          var _a;
      };
  }
  var push = makeArrayMethod('push');

  function cubicOut(t) {
    var f = t - 1.0;
    return f * f * f + 1.0;
  }

  function slide(node, ref) {
  	var delay = ref.delay;if (delay === void 0) delay = 0;
  	var duration = ref.duration;if (duration === void 0) duration = 400;
  	var easing = ref.easing;if (easing === void 0) easing = cubicOut;

  	var style = getComputedStyle(node);
  	var opacity = +style.opacity;
  	var height = parseFloat(style.height);
  	var paddingTop = parseFloat(style.paddingTop);
  	var paddingBottom = parseFloat(style.paddingBottom);
  	var marginTop = parseFloat(style.marginTop);
  	var marginBottom = parseFloat(style.marginBottom);
  	var borderTopWidth = parseFloat(style.borderTopWidth);
  	var borderBottomWidth = parseFloat(style.borderBottomWidth);

  	return {
  		delay: delay,
  		duration: duration,
  		easing: easing,
  		css: function css(t) {
  			return "overflow: hidden;" + "opacity: " + Math.min(t * 20, 1) * opacity + ";" + "height: " + t * height + "px;" + "padding-top: " + t * paddingTop + "px;" + "padding-bottom: " + t * paddingBottom + "px;" + "margin-top: " + t * marginTop + "px;" + "margin-bottom: " + t * marginBottom + "px;" + "border-top-width: " + t * borderTopWidth + "px;" + "border-bottom-width: " + t * borderBottomWidth + "px;";
  		}
  	};
  }

  /* src/components/Navigation.html generated by Svelte v1.64.1 */

  function data() {
  	return {
  		menu: [{
  			label: "Home",
  			url: "index.html"
  		}, {
  			label: "Work",
  			submenu: [{
  				label: "Web",
  				url: "/web"
  			}, {
  				label: "Design",
  				url: "/branding"
  			}, {
  				label: "Illustration",
  				url: "/illustration"
  			}]
  		}, {
  			label: "Github",
  			icon: "github",
  			url: "https://github.com/simonlayfield/",
  			flexible: true
  		}, {
  			label: "Contact",
  			url: "https://aemail.com/Z6J",
  			flexible: true
  		}],
  		submenuItems: []
  	};
  }
  var methods = {
  	push: push,
  	processMenuItemClick: function processMenuItemClick(index) {
  		if (this.get('submenuItems').length) {
  			this.set({ submenuItems: [] });
  		} else {
  			var submenu = this.get('menu'),
  			    submenuItems = submenu[index].submenu;
  			this.set({ submenuItems: submenuItems });
  		}
  	}
  };

  function create_main_fragment(component, state) {
  	var header, nav, text, header_class_value;

  	var each_value = state.menu;

  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
  			each_value: each_value,
  			menuItem: each_value[i],
  			index: i
  		}));
  	}

  	var if_block = state.submenuItems.length && create_if_block_2(component, state);

  	return {
  		c: function create() {
  			header = createElement("header");
  			nav = createElement("nav");

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			text = createText("\n\t\t");
  			if (if_block) if_block.c();
  			this.h();
  		},

  		h: function hydrate() {
  			nav.className = "ui-navigation -center";
  			header.className = header_class_value = "app-header " + (state.version ? '-' + state.version : '');
  		},

  		m: function mount(target, anchor) {
  			insertNode(header, target, anchor);
  			appendNode(nav, header);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(nav, null);
  			}

  			appendNode(text, nav);
  			if (if_block) if_block.i(nav, null);
  		},

  		p: function update(changed, state) {
  			var each_value = state.menu;

  			if (changed.menu) {
  				for (var i = 0; i < each_value.length; i += 1) {
  					var each_context = assign(assign({}, state), {
  						each_value: each_value,
  						menuItem: each_value[i],
  						index: i
  					});

  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, each_context);
  					} else {
  						each_blocks[i] = create_each_block(component, each_context);
  						each_blocks[i].c();
  						each_blocks[i].m(nav, text);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = each_value.length;
  			}

  			if (state.submenuItems.length) {
  				if (if_block) {
  					if_block.p(changed, state);
  				} else {
  					if_block = create_if_block_2(component, state);
  					if (if_block) if_block.c();
  				}

  				if_block.i(nav, null);
  			} else if (if_block) {
  				if_block.o(function () {
  					if_block.u();
  					if_block.d();
  					if_block = null;
  				});
  			}

  			if (changed.version && header_class_value !== (header_class_value = "app-header " + (state.version ? '-' + state.version : ''))) {
  				header.className = header_class_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(header);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].u();
  			}

  			if (if_block) if_block.u();
  		},

  		d: function destroy$$1() {
  			destroyEach(each_blocks);

  			if (if_block) if_block.d();
  		}
  	};
  }

  // (3:2) {{#each menu as menuItem, index}}
  function create_each_block(component, state) {
  	var menuItem = state.menuItem,
  	    each_value = state.each_value,
  	    index = state.index;
  	var text, if_block_1_anchor;

  	var if_block = menuItem.url && create_if_block(component, state);

  	var if_block_1 = !menuItem.url && create_if_block_1(component, state);

  	return {
  		c: function create() {
  			if (if_block) if_block.c();
  			text = createText("\n\t\t\t");
  			if (if_block_1) if_block_1.c();
  			if_block_1_anchor = createComment();
  		},

  		m: function mount(target, anchor) {
  			if (if_block) if_block.m(target, anchor);
  			insertNode(text, target, anchor);
  			if (if_block_1) if_block_1.m(target, anchor);
  			insertNode(if_block_1_anchor, target, anchor);
  		},

  		p: function update(changed, state) {
  			menuItem = state.menuItem;
  			each_value = state.each_value;
  			index = state.index;
  			if (menuItem.url) {
  				if (if_block) {
  					if_block.p(changed, state);
  				} else {
  					if_block = create_if_block(component, state);
  					if_block.c();
  					if_block.m(text.parentNode, text);
  				}
  			} else if (if_block) {
  				if_block.u();
  				if_block.d();
  				if_block = null;
  			}

  			if (!menuItem.url) {
  				if (if_block_1) {
  					if_block_1.p(changed, state);
  				} else {
  					if_block_1 = create_if_block_1(component, state);
  					if_block_1.c();
  					if_block_1.m(if_block_1_anchor.parentNode, if_block_1_anchor);
  				}
  			} else if (if_block_1) {
  				if_block_1.u();
  				if_block_1.d();
  				if_block_1 = null;
  			}
  		},

  		u: function unmount() {
  			if (if_block) if_block.u();
  			detachNode(text);
  			if (if_block_1) if_block_1.u();
  			detachNode(if_block_1_anchor);
  		},

  		d: function destroy$$1() {
  			if (if_block) if_block.d();
  			if (if_block_1) if_block_1.d();
  		}
  	};
  }

  // (4:3) {{#if menuItem.url}}
  function create_if_block(component, state) {
  	var menuItem = state.menuItem,
  	    each_value = state.each_value,
  	    index = state.index;
  	var a,
  	    text_value = menuItem.label,
  	    text,
  	    a_href_value;

  	return {
  		c: function create() {
  			a = createElement("a");
  			text = createText(text_value);
  			this.h();
  		},

  		h: function hydrate() {
  			a.className = "link";
  			a.href = a_href_value = menuItem.url;
  		},

  		m: function mount(target, anchor) {
  			insertNode(a, target, anchor);
  			appendNode(text, a);
  		},

  		p: function update(changed, state) {
  			menuItem = state.menuItem;
  			each_value = state.each_value;
  			index = state.index;
  			if (changed.menu && text_value !== (text_value = menuItem.label)) {
  				text.data = text_value;
  			}

  			if (changed.menu && a_href_value !== (a_href_value = menuItem.url)) {
  				a.href = a_href_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(a);
  		},

  		d: noop
  	};
  }

  // (7:3) {{#if !menuItem.url}}
  function create_if_block_1(component, state) {
  	var menuItem = state.menuItem,
  	    each_value = state.each_value,
  	    index = state.index;
  	var button,
  	    text_value = menuItem.label,
  	    text;

  	return {
  		c: function create() {
  			button = createElement("button");
  			text = createText(text_value);
  			this.h();
  		},

  		h: function hydrate() {
  			addListener(button, "click", click_handler);
  			button.className = "link";

  			button._svelte = {
  				component: component,
  				each_value: state.each_value,
  				index: state.index
  			};
  		},

  		m: function mount(target, anchor) {
  			insertNode(button, target, anchor);
  			appendNode(text, button);
  		},

  		p: function update(changed, state) {
  			menuItem = state.menuItem;
  			each_value = state.each_value;
  			index = state.index;
  			if (changed.menu && text_value !== (text_value = menuItem.label)) {
  				text.data = text_value;
  			}

  			button._svelte.each_value = state.each_value;
  			button._svelte.index = state.index;
  		},

  		u: function unmount() {
  			detachNode(button);
  		},

  		d: function destroy$$1() {
  			removeListener(button, "click", click_handler);
  		}
  	};
  }

  // (13:4) {{#each submenuItems as submenuItem}}
  function create_each_block_1(component, state) {
  	var submenuItem = state.submenuItem,
  	    each_value_1 = state.each_value_1,
  	    submenuItem_index = state.submenuItem_index;
  	var a,
  	    text_value = submenuItem.label,
  	    text,
  	    a_href_value;

  	return {
  		c: function create() {
  			a = createElement("a");
  			text = createText(text_value);
  			this.h();
  		},

  		h: function hydrate() {
  			a.className = "link";
  			a.href = a_href_value = submenuItem.url;
  		},

  		m: function mount(target, anchor) {
  			insertNode(a, target, anchor);
  			appendNode(text, a);
  		},

  		p: function update(changed, state) {
  			submenuItem = state.submenuItem;
  			each_value_1 = state.each_value_1;
  			submenuItem_index = state.submenuItem_index;
  			if (changed.submenuItems && text_value !== (text_value = submenuItem.label)) {
  				text.data = text_value;
  			}

  			if (changed.submenuItems && a_href_value !== (a_href_value = submenuItem.url)) {
  				a.href = a_href_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(a);
  		},

  		d: noop
  	};
  }

  // (11:2) {{#if submenuItems.length}}
  function create_if_block_2(component, state) {
  	var nav, nav_transition, introing, outroing;

  	var each_value_1 = state.submenuItems;

  	var each_blocks = [];

  	for (var i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
  			each_value_1: each_value_1,
  			submenuItem: each_value_1[i],
  			submenuItem_index: i
  		}));
  	}

  	return {
  		c: function create() {
  			nav = createElement("nav");

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}
  			this.h();
  		},

  		h: function hydrate() {
  			nav.className = "subnav";
  		},

  		m: function mount(target, anchor) {
  			insertNode(nav, target, anchor);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(nav, null);
  			}
  		},

  		p: function update(changed, state) {
  			var each_value_1 = state.submenuItems;

  			if (changed.submenuItems) {
  				for (var i = 0; i < each_value_1.length; i += 1) {
  					var each_context = assign(assign({}, state), {
  						each_value_1: each_value_1,
  						submenuItem: each_value_1[i],
  						submenuItem_index: i
  					});

  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, each_context);
  					} else {
  						each_blocks[i] = create_each_block_1(component, each_context);
  						each_blocks[i].c();
  						each_blocks[i].m(nav, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = each_value_1.length;
  			}
  		},

  		i: function intro(target, anchor) {
  			if (introing) return;
  			introing = true;
  			outroing = false;

  			component.root._aftercreate.push(function () {
  				if (!nav_transition) nav_transition = wrapTransition(component, nav, slide, {}, true, null);
  				nav_transition.run(true, function () {
  					component.fire("intro.end", { node: nav });
  				});
  			});

  			this.m(target, anchor);
  		},

  		o: function outro(outrocallback) {
  			if (outroing) return;
  			outroing = true;
  			introing = false;

  			var outros = 1;

  			nav_transition.run(false, function () {
  				component.fire("outro.end", { node: nav });
  				if (--outros === 0) outrocallback();
  				nav_transition = null;
  			});
  		},

  		u: function unmount() {
  			detachNode(nav);

  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].u();
  			}
  		},

  		d: function destroy$$1() {
  			destroyEach(each_blocks);
  		}
  	};
  }

  function click_handler(event) {
  	var component = this._svelte.component;
  	var each_value = this._svelte.each_value,
  	    index = this._svelte.index,
  	    menuItem = each_value[index];
  	component.processMenuItemClick(index);
  }

  function Navigation(options) {
  	init(this, options);
  	this._state = assign(data(), options.data);

  	if (!options.root) {
  		this._oncreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);

  		callAll(this._aftercreate);
  	}
  }

  assign(Navigation.prototype, proto);
  assign(Navigation.prototype, methods);

  /* src/components/Content.html generated by Svelte v1.64.1 */

  function create_main_fragment$1(component, state) {
  	var div,
  	    slot_content_default = component._slotted.default;

  	return {
  		c: function create() {
  			div = createElement("div");
  			this.h();
  		},

  		h: function hydrate() {
  			div.className = "ui-block -center -padded";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);

  			if (slot_content_default) {
  				appendNode(slot_content_default, div);
  			}
  		},

  		p: noop,

  		u: function unmount() {
  			detachNode(div);

  			if (slot_content_default) {
  				reinsertChildren(div, slot_content_default);
  			}
  		},

  		d: noop
  	};
  }

  function Content(options) {
  	init(this, options);
  	this._state = assign({}, options.data);

  	this._slotted = options.slots || {};

  	this.slots = {};

  	this._fragment = create_main_fragment$1(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);
  	}
  }

  assign(Content.prototype, proto);

  /* src/components/Showcase.html generated by Svelte v1.64.1 */

  function showcaseData(dataUrl) {
  	return fetch(dataUrl).then(function (res) {
  		if (!res.ok) {
  			throw Error(res.statusText);
  		}
  		return res;
  	}).then(function (res) {
  		return res.json();
  	}).then(function (data) {
  		return data.assets;
  	}).catch(function (error) {
  		return console.log(error);
  	});
  }

  function data$1() {
  	return {};
  }
  function add_css() {
  	var style = createElement("style");
  	style.id = 'svelte-1lefyua-style';
  	style.textContent = ".svelte-1lefyua.-simple,.svelte-1lefyua .-simple,.svelte-1lefyua.-detailed,.svelte-1lefyua .-detailed{width:100%;display:grid;grid-template-columns:1fr;grid-gap:30px}.svelte-1lefyua.-simple .ui-card,.svelte-1lefyua .-simple .ui-card{box-shadow:none}.svelte-1lefyua.-mosaic,.svelte-1lefyua .-mosaic{-moz-column-count:1;-moz-column-gap:20px;-webkit-column-count:1;-webkit-column-gap:20px;column-count:1;column-gap:20px;text-align:center}.svelte-1lefyua.-mosaic img,.svelte-1lefyua .-mosaic img{margin-bottom:20px;border-radius:5px}.svelte-1lefyua.ui-card__details,.svelte-1lefyua .ui-card__details{border:1px solid #ccc}@media(min-width: 500px){.svelte-1lefyua.-simple,.svelte-1lefyua .-simple,.svelte-1lefyua.-detailed,.svelte-1lefyua .-detailed{grid-template-columns:repeat(2, 1fr)}.svelte-1lefyua.-mosaic,.svelte-1lefyua .-mosaic{-moz-column-count:2;-moz-column-gap:20px;-webkit-column-count:2;-webkit-column-gap:20px;column-count:2}}@media(min-width: 1200px){.svelte-1lefyua.-simple,.svelte-1lefyua .-simple,.svelte-1lefyua.-detailed,.svelte-1lefyua .-detailed{grid-template-columns:repeat(3, 1fr)}.svelte-1lefyua.-mosaic,.svelte-1lefyua .-mosaic{-moz-column-count:3;-moz-column-gap:20px;-webkit-column-count:3;-webkit-column-gap:20px;column-count:3}}.svelte-1lefyua.row,.svelte-1lefyua .row{padding-top:2rem;padding-bottom:2rem}.svelte-1lefyua.row.-bg,.svelte-1lefyua .row.-bg{background:#f1f1f1}.svelte-1lefyua.row.-padded,.svelte-1lefyua .row.-padded{padding-left:1rem;padding-right:1rem}";
  	appendNode(style, document.head);
  }

  function create_main_fragment$2(component, state) {
  	var await_block_anchor, await_block_1, await_block_type, await_token, promise, resolved;

  	function replace_await_block(token, type, state) {
  		if (token !== await_token) return;

  		var old_block = await_block_1;
  		await_block_1 = type && (await_block_type = type)(component, state);

  		if (old_block) {
  			old_block.u();
  			old_block.d();
  			await_block_1.c();
  			await_block_1.m(await_block_anchor.parentNode, await_block_anchor);

  			component.root.set({});
  		}
  	}

  	function handle_promise(promise, state) {
  		var token = await_token = {};

  		if (isPromise(promise)) {
  			promise.then(function (value) {
  				var state = component.get();
  				resolved = { assets: value };
  				replace_await_block(token, create_then_block, assign(assign({}, state), resolved));
  			}, function (error) {
  				var state = component.get();
  				resolved = { theError: error };
  				replace_await_block(token, create_catch_block, assign(assign({}, state), resolved));
  			});

  			// if we previously had a then/catch block, destroy it
  			if (await_block_type !== create_pending_block) {
  				replace_await_block(token, create_pending_block, state);
  				return true;
  			}
  		} else {
  			resolved = { assets: promise };
  			if (await_block_type !== create_then_block) {
  				replace_await_block(token, create_then_block, assign(assign({}, state), resolved));
  				return true;
  			}
  		}
  	}

  	handle_promise(promise = state.showcaseData, state);

  	return {
  		c: function create() {
  			await_block_anchor = createComment();

  			await_block_1.c();
  		},

  		m: function mount(target, anchor) {
  			insertNode(await_block_anchor, target, anchor);

  			await_block_1.m(target, anchor);
  		},

  		p: function update(changed, state) {
  			if ('showcaseData' in changed && promise !== (promise = state.showcaseData) && handle_promise(promise, state)) ; else {
  				await_block_1.p(changed, assign(assign({}, state), resolved));
  			}
  		},

  		u: function unmount() {
  			detachNode(await_block_anchor);

  			await_block_1.u();
  		},

  		d: function destroy$$1() {
  			await_token = null;
  			await_block_1.d();
  		}
  	};
  }

  // (1:23)   <div class="ui-block -center">loading...</div> {{then assets}}
  function create_pending_block(component, state) {
  	var div;

  	return {
  		c: function create() {
  			div = createElement("div");
  			div.textContent = "loading...";
  			this.h();
  		},

  		h: function hydrate() {
  			div.className = "ui-block -center svelte-1lefyua";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  		},

  		p: noop,

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  // (10:3) {{#each assets as asset}}
  function create_each_block$1(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined,
  	    asset = state.asset,
  	    each_value = state.each_value,
  	    asset_index = state.asset_index;
  	var img, img_src_value;

  	return {
  		c: function create() {
  			img = createElement("img");
  			this.h();
  		},

  		h: function hydrate() {
  			img.src = img_src_value = asset.image;
  			img.alt = "";
  		},

  		m: function mount(target, anchor) {
  			insertNode(img, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			asset = state.asset;
  			each_value = state.each_value;
  			asset_index = state.asset_index;
  			if (changed.showcaseData && img_src_value !== (img_src_value = asset.image)) {
  				img.src = img_src_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(img);
  		},

  		d: noop
  	};
  }

  // (16:3) {{#each assets as asset}}
  function create_each_block_1$1(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined,
  	    asset = state.asset,
  	    each_value_1 = state.each_value_1,
  	    asset_index_1 = state.asset_index_1;
  	var div, img, img_src_value;

  	return {
  		c: function create() {
  			div = createElement("div");
  			img = createElement("img");
  			this.h();
  		},

  		h: function hydrate() {
  			img.src = img_src_value = asset.image;
  			img.alt = "";
  			div.className = "ui-card";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  			appendNode(img, div);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			asset = state.asset;
  			each_value_1 = state.each_value_1;
  			asset_index_1 = state.asset_index_1;
  			if (changed.showcaseData && img_src_value !== (img_src_value = asset.image)) {
  				img.src = img_src_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  // (24:3) {{#each assets as asset}}
  function create_each_block_2(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined,
  	    asset = state.asset,
  	    each_value_2 = state.each_value_2,
  	    asset_index_2 = state.asset_index_2;
  	var div,
  	    text,
  	    a,
  	    img,
  	    img_src_value,
  	    a_href_value,
  	    text_2,
  	    div_1,
  	    h3,
  	    a_1,
  	    text_3_value = asset.name,
  	    text_3,
  	    a_1_href_value,
  	    text_5,
  	    p,
  	    raw_value = asset.detail;

  	function select_block_type(state) {
  		if (asset.type === 'commercial') return create_if_block_3;
  		return create_if_block_4;
  	}

  	var current_block_type = select_block_type(state);
  	var if_block = current_block_type(component, state);

  	return {
  		c: function create() {
  			div = createElement("div");
  			if_block.c();
  			text = createText("\n\t\t\t\t\t");
  			a = createElement("a");
  			img = createElement("img");
  			text_2 = createText("\n\t\t\t\t\t");
  			div_1 = createElement("div");
  			h3 = createElement("h3");
  			a_1 = createElement("a");
  			text_3 = createText(text_3_value);
  			text_5 = createText("\n\n\t\t\t\t\t\t");
  			p = createElement("p");
  			this.h();
  		},

  		h: function hydrate() {
  			img.src = img_src_value = asset.image;
  			img.alt = "";
  			a.href = a_href_value = asset.url;
  			a.target = "_blank";
  			a_1.href = a_1_href_value = asset.url;
  			a_1.target = "_blank";
  			a_1.className = "link";
  			h3.className = "ui-heading -tertiary";
  			div_1.className = "details";
  			div.className = "ui-card -highlight";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  			if_block.m(div, null);
  			appendNode(text, div);
  			appendNode(a, div);
  			appendNode(img, a);
  			appendNode(text_2, div);
  			appendNode(div_1, div);
  			appendNode(h3, div_1);
  			appendNode(a_1, h3);
  			appendNode(text_3, a_1);
  			appendNode(text_5, div_1);
  			appendNode(p, div_1);
  			p.innerHTML = raw_value;
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			asset = state.asset;
  			each_value_2 = state.each_value_2;
  			asset_index_2 = state.asset_index_2;
  			if (current_block_type !== (current_block_type = select_block_type(state))) {
  				if_block.u();
  				if_block.d();
  				if_block = current_block_type(component, state);
  				if_block.c();
  				if_block.m(div, text);
  			}

  			if (changed.showcaseData && img_src_value !== (img_src_value = asset.image)) {
  				img.src = img_src_value;
  			}

  			if (changed.showcaseData && a_href_value !== (a_href_value = asset.url)) {
  				a.href = a_href_value;
  			}

  			if (changed.showcaseData && text_3_value !== (text_3_value = asset.name)) {
  				text_3.data = text_3_value;
  			}

  			if (changed.showcaseData && a_1_href_value !== (a_1_href_value = asset.url)) {
  				a_1.href = a_1_href_value;
  			}

  			if (changed.showcaseData && raw_value !== (raw_value = asset.detail)) {
  				p.innerHTML = raw_value;
  			}
  		},

  		u: function unmount() {
  			p.innerHTML = '';

  			detachNode(div);
  			if_block.u();
  		},

  		d: function destroy$$1() {
  			if_block.d();
  		}
  	};
  }

  // (27:5) {{#if asset.type === 'commercial'}}
  function create_if_block_3(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined,
  	    asset = state.asset,
  	    each_value_2 = state.each_value_2,
  	    asset_index_2 = state.asset_index_2;
  	var div;

  	return {
  		c: function create() {
  			div = createElement("div");
  			div.innerHTML = "<span>commercial</span>";
  			this.h();
  		},

  		h: function hydrate() {
  			div.className = "label";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			asset = state.asset;
  			each_value_2 = state.each_value_2;
  			asset_index_2 = state.asset_index_2;
  		},

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  // (33:5) {{else}}
  function create_if_block_4(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined,
  	    asset = state.asset,
  	    each_value_2 = state.each_value_2,
  	    asset_index_2 = state.asset_index_2;
  	var div;

  	return {
  		c: function create() {
  			div = createElement("div");
  			div.innerHTML = "<span>personal</span>";
  			this.h();
  		},

  		h: function hydrate() {
  			div.className = "label -alt";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			asset = state.asset;
  			each_value_2 = state.each_value_2;
  			asset_index_2 = state.asset_index_2;
  		},

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  // (8:2) {{#if type == "mosaic"}}
  function create_if_block$1(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined;
  	var each_anchor;

  	var each_value = assets;

  	var each_blocks = [];

  	for (var i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
  			each_value: each_value,
  			asset: each_value[i],
  			asset_index: i
  		}));
  	}

  	return {
  		c: function create() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_anchor = createComment();
  		},

  		m: function mount(target, anchor) {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insertNode(each_anchor, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			var each_value = assets;

  			if (changed.showcaseData) {
  				for (var i = 0; i < each_value.length; i += 1) {
  					var each_context = assign(assign({}, state), {
  						each_value: each_value,
  						asset: each_value[i],
  						asset_index: i
  					});

  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, each_context);
  					} else {
  						each_blocks[i] = create_each_block$1(component, each_context);
  						each_blocks[i].c();
  						each_blocks[i].m(each_anchor.parentNode, each_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = each_value.length;
  			}
  		},

  		u: function unmount() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].u();
  			}

  			detachNode(each_anchor);
  		},

  		d: function destroy$$1() {
  			destroyEach(each_blocks);
  		}
  	};
  }

  // (14:29) 
  function create_if_block_1$1(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined;
  	var each_anchor;

  	var each_value_1 = assets;

  	var each_blocks = [];

  	for (var i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1$1(component, assign(assign({}, state), {
  			each_value_1: each_value_1,
  			asset: each_value_1[i],
  			asset_index_1: i
  		}));
  	}

  	return {
  		c: function create() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_anchor = createComment();
  		},

  		m: function mount(target, anchor) {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insertNode(each_anchor, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			var each_value_1 = assets;

  			if (changed.showcaseData) {
  				for (var i = 0; i < each_value_1.length; i += 1) {
  					var each_context = assign(assign({}, state), {
  						each_value_1: each_value_1,
  						asset: each_value_1[i],
  						asset_index_1: i
  					});

  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, each_context);
  					} else {
  						each_blocks[i] = create_each_block_1$1(component, each_context);
  						each_blocks[i].c();
  						each_blocks[i].m(each_anchor.parentNode, each_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = each_value_1.length;
  			}
  		},

  		u: function unmount() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].u();
  			}

  			detachNode(each_anchor);
  		},

  		d: function destroy$$1() {
  			destroyEach(each_blocks);
  		}
  	};
  }

  // (22:31) 
  function create_if_block_2$1(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined;
  	var each_anchor;

  	var each_value_2 = assets;

  	var each_blocks = [];

  	for (var i = 0; i < each_value_2.length; i += 1) {
  		each_blocks[i] = create_each_block_2(component, assign(assign({}, state), {
  			each_value_2: each_value_2,
  			asset: each_value_2[i],
  			asset_index_2: i
  		}));
  	}

  	return {
  		c: function create() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_anchor = createComment();
  		},

  		m: function mount(target, anchor) {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insertNode(each_anchor, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			var each_value_2 = assets;

  			if (changed.showcaseData) {
  				for (var i = 0; i < each_value_2.length; i += 1) {
  					var each_context = assign(assign({}, state), {
  						each_value_2: each_value_2,
  						asset: each_value_2[i],
  						asset_index_2: i
  					});

  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, each_context);
  					} else {
  						each_blocks[i] = create_each_block_2(component, each_context);
  						each_blocks[i].c();
  						each_blocks[i].m(each_anchor.parentNode, each_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = each_value_2.length;
  			}
  		},

  		u: function unmount() {
  			for (var i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].u();
  			}

  			detachNode(each_anchor);
  		},

  		d: function destroy$$1() {
  			destroyEach(each_blocks);
  		}
  	};
  }

  // (57:2) {{else}}
  function create_if_block_5(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined;
  	var p;

  	return {
  		c: function create() {
  			p = createElement("p");
  			p.textContent = "No items found";
  		},

  		m: function mount(target, anchor) {
  			insertNode(p, target, anchor);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  		},

  		u: function unmount() {
  			detachNode(p);
  		},

  		d: noop
  	};
  }

  // (3:0) {{then assets}}
  function create_then_block(component, state) {
  	var assets = state.assets,
  	    undefined = state.undefined,
  	    undefined = state.undefined;
  	var div, div_1, div_1_class_value, div_class_value;

  	function select_block_type_1(state) {
  		if (state.type == "mosaic") return create_if_block$1;
  		if (state.type == "simple") return create_if_block_1$1;
  		if (state.type == "detailed") return create_if_block_2$1;
  		return create_if_block_5;
  	}

  	var current_block_type = select_block_type_1(state);
  	var if_block = current_block_type(component, state);

  	return {
  		c: function create() {
  			div = createElement("div");
  			div_1 = createElement("div");
  			if_block.c();
  			this.h();
  		},

  		h: function hydrate() {
  			div_1.className = div_1_class_value = "ui-container -" + state.type + " -padded";
  			div.className = div_class_value = "row " + (state.type == 'detailed' ? '-bg' : '') + " -padded" + " svelte-1lefyua";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  			appendNode(div_1, div);
  			if_block.m(div_1, null);
  		},

  		p: function update(changed, state) {
  			assets = state.assets;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			if (current_block_type === (current_block_type = select_block_type_1(state)) && if_block) {
  				if_block.p(changed, state);
  			} else {
  				if_block.u();
  				if_block.d();
  				if_block = current_block_type(component, state);
  				if_block.c();
  				if_block.m(div_1, null);
  			}

  			if (changed.type && div_1_class_value !== (div_1_class_value = "ui-container -" + state.type + " -padded")) {
  				div_1.className = div_1_class_value;
  			}

  			if (changed.type && div_class_value !== (div_class_value = "row " + (state.type == 'detailed' ? '-bg' : '') + " -padded" + " svelte-1lefyua")) {
  				div.className = div_class_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(div);
  			if_block.u();
  		},

  		d: function destroy$$1() {
  			if_block.d();
  		}
  	};
  }

  // (66:0) {{catch theError}}
  function create_catch_block(component, state) {
  	var theError = state.theError,
  	    undefined = state.undefined,
  	    undefined = state.undefined;
  	var p,
  	    text,
  	    text_1_value = theError.message,
  	    text_1;

  	return {
  		c: function create() {
  			p = createElement("p");
  			text = createText("whoops! ");
  			text_1 = createText(text_1_value);
  			this.h();
  		},

  		h: function hydrate() {
  			p.className = "svelte-1lefyua";
  		},

  		m: function mount(target, anchor) {
  			insertNode(p, target, anchor);
  			appendNode(text, p);
  			appendNode(text_1, p);
  		},

  		p: function update(changed, state) {
  			theError = state.theError;
  			undefined = state.undefined;
  			undefined = state.undefined;
  			if (changed.showcaseData && text_1_value !== (text_1_value = theError.message)) {
  				text_1.data = text_1_value;
  			}
  		},

  		u: function unmount() {
  			detachNode(p);
  		},

  		d: noop
  	};
  }

  function Showcase(options) {
  	init(this, options);
  	this._state = assign(data$1(), options.data);
  	this._recompute({ dataUrl: 1 }, this._state);

  	if (!document.getElementById("svelte-1lefyua-style")) add_css();

  	this._fragment = create_main_fragment$2(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);
  	}
  }

  assign(Showcase.prototype, proto);

  Showcase.prototype._recompute = function _recompute(changed, state) {
  	if (changed.dataUrl) {
  		if (this._differs(state.showcaseData, state.showcaseData = showcaseData(state.dataUrl))) changed.showcaseData = true;
  	}
  };

  /* src/components/PageBranding.html generated by Svelte v1.64.1 */

  function data$2() {
  	return {};
  }
  function create_main_fragment$3(component, state) {
  	var text, text_1, h1, text_2, text_3, p, text_4, text_5, text_6, text_7;

  	var navigation = new Navigation({
  		root: component.root
  	});

  	var content = new Content({
  		root: component.root,
  		slots: { default: createFragment() }
  	});

  	var showcase_initial_data = {
  		type: "simple",
  		dataUrl: "/js/branding.json"
  	};
  	var showcase = new Showcase({
  		root: component.root,
  		data: showcase_initial_data
  	});

  	var showcase_1_initial_data = {
  		type: "mosaic",
  		dataUrl: "/js/mockups.json"
  	};
  	var showcase_1 = new Showcase({
  		root: component.root,
  		data: showcase_1_initial_data
  	});

  	return {
  		c: function create() {
  			navigation._fragment.c();
  			text = createText("\n");
  			text_1 = createText("\n\t");
  			h1 = createElement("h1");
  			text_2 = createText("Design");
  			text_3 = createText("\n\t");
  			p = createElement("p");
  			text_4 = createText("My design work covers a broad range of requirements but has more recently been focussed on branding and branded products.");
  			text_5 = createText("\n");
  			content._fragment.c();
  			text_6 = createText("\n");
  			showcase._fragment.c();
  			text_7 = createText("\n");
  			showcase_1._fragment.c();
  			this.h();
  		},

  		h: function hydrate() {
  			h1.className = "ui-heading";
  		},

  		m: function mount(target, anchor) {
  			navigation._mount(target, anchor);
  			insertNode(text, target, anchor);
  			appendNode(text_1, content._slotted.default);
  			appendNode(h1, content._slotted.default);
  			appendNode(text_2, h1);
  			appendNode(text_3, content._slotted.default);
  			appendNode(p, content._slotted.default);
  			appendNode(text_4, p);
  			appendNode(text_5, content._slotted.default);
  			content._mount(target, anchor);
  			insertNode(text_6, target, anchor);
  			showcase._mount(target, anchor);
  			insertNode(text_7, target, anchor);
  			showcase_1._mount(target, anchor);
  		},

  		p: noop,

  		u: function unmount() {
  			navigation._unmount();
  			detachNode(text);
  			content._unmount();
  			detachNode(text_6);
  			showcase._unmount();
  			detachNode(text_7);
  			showcase_1._unmount();
  		},

  		d: function destroy$$1() {
  			navigation.destroy(false);
  			content.destroy(false);
  			showcase.destroy(false);
  			showcase_1.destroy(false);
  		}
  	};
  }

  function PageBranding(options) {
  	init(this, options);
  	this._state = assign(data$2(), options.data);

  	if (!options.root) {
  		this._oncreate = [];
  		this._beforecreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment$3(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(PageBranding.prototype, proto);

  /* src/components/PageIllustration.html generated by Svelte v1.64.1 */

  function data$3() {
  	return {
  		showcaseData: {
  			type: "mosaic"
  		}
  	};
  }
  function create_main_fragment$4(component, state) {
  	var text, text_1, h1, text_2, text_3, p, text_4, p_1, text_5, a, text_7, text_8, text_9;

  	var navigation = new Navigation({
  		root: component.root
  	});

  	var content = new Content({
  		root: component.root,
  		slots: { default: createFragment() }
  	});

  	var showcase_initial_data = {
  		type: state.showcaseData.type,
  		dataUrl: "/js/illustration.json"
  	};
  	var showcase = new Showcase({
  		root: component.root,
  		data: showcase_initial_data
  	});

  	return {
  		c: function create() {
  			navigation._fragment.c();
  			text = createText("\n");
  			text_1 = createText("\n\t");
  			h1 = createElement("h1");
  			text_2 = createText("Illustration");
  			text_3 = createText("\n\t");
  			p = createElement("p");
  			text_4 = createText("Most of my illustrations are recreational, but I do incorporate it in to work when necessary.");
  			p_1 = createElement("p");
  			text_5 = createText("I occasionally contibute to a blog called ");
  			a = createElement("a");
  			a.textContent = "Two Minute Noodles";
  			text_7 = createText(".");
  			text_8 = createText("\n");
  			content._fragment.c();
  			text_9 = createText("\n");
  			showcase._fragment.c();
  			this.h();
  		},

  		h: function hydrate() {
  			h1.className = "ui-heading";
  			a.href = "http://twominutenoodles.com";
  		},

  		m: function mount(target, anchor) {
  			navigation._mount(target, anchor);
  			insertNode(text, target, anchor);
  			appendNode(text_1, content._slotted.default);
  			appendNode(h1, content._slotted.default);
  			appendNode(text_2, h1);
  			appendNode(text_3, content._slotted.default);
  			appendNode(p, content._slotted.default);
  			appendNode(text_4, p);
  			appendNode(p_1, content._slotted.default);
  			appendNode(text_5, p_1);
  			appendNode(a, p_1);
  			appendNode(text_7, p_1);
  			appendNode(text_8, content._slotted.default);
  			content._mount(target, anchor);
  			insertNode(text_9, target, anchor);
  			showcase._mount(target, anchor);
  		},

  		p: function update(changed, state) {
  			var showcase_changes = {};
  			if (changed.showcaseData) showcase_changes.type = state.showcaseData.type;
  			showcase._set(showcase_changes);
  		},

  		u: function unmount() {
  			navigation._unmount();
  			detachNode(text);
  			content._unmount();
  			detachNode(text_9);
  			showcase._unmount();
  		},

  		d: function destroy$$1() {
  			navigation.destroy(false);
  			content.destroy(false);
  			showcase.destroy(false);
  		}
  	};
  }

  function PageIllustration(options) {
  	init(this, options);
  	this._state = assign(data$3(), options.data);

  	if (!options.root) {
  		this._oncreate = [];
  		this._beforecreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment$4(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(PageIllustration.prototype, proto);

  /* src/components/PageWeb.html generated by Svelte v1.64.1 */

  function data$4() {
  	return {
  		showcaseData: {
  			type: "detailed"
  		}
  	};
  }
  function create_main_fragment$5(component, state) {
  	var text, text_1, h1, text_2, text_3, p, text_4, em, text_6, text_7, p_1, text_8, a, text_10, text_11, text_12;

  	var navigation = new Navigation({
  		root: component.root
  	});

  	var content = new Content({
  		root: component.root,
  		slots: { default: createFragment() }
  	});

  	var showcase_initial_data = {
  		type: state.showcaseData.type,
  		dataUrl: "/js/web.json"
  	};
  	var showcase = new Showcase({
  		root: component.root,
  		data: showcase_initial_data
  	});

  	return {
  		c: function create() {
  			navigation._fragment.c();
  			text = createText("\n");
  			text_1 = createText("\n\t");
  			h1 = createElement("h1");
  			text_2 = createText("Web");
  			text_3 = createText("\n\t");
  			p = createElement("p");
  			text_4 = createText("I ");
  			em = createElement("em");
  			em.textContent = "try";
  			text_6 = createText(" to keep these projects as up-to-date as possible.");
  			text_7 = createText("\n\t");
  			p_1 = createElement("p");
  			text_8 = createText("Recently I have mainly been working on my own personal project, ");
  			a = createElement("a");
  			a.textContent = "TYPEREEL";
  			text_10 = createText(".");
  			text_11 = createText("\n");
  			content._fragment.c();
  			text_12 = createText("\n");
  			showcase._fragment.c();
  			this.h();
  		},

  		h: function hydrate() {
  			h1.className = "ui-heading";
  			a.href = "http://typereel.io/";
  			a.target = "_blank";
  		},

  		m: function mount(target, anchor) {
  			navigation._mount(target, anchor);
  			insertNode(text, target, anchor);
  			appendNode(text_1, content._slotted.default);
  			appendNode(h1, content._slotted.default);
  			appendNode(text_2, h1);
  			appendNode(text_3, content._slotted.default);
  			appendNode(p, content._slotted.default);
  			appendNode(text_4, p);
  			appendNode(em, p);
  			appendNode(text_6, p);
  			appendNode(text_7, content._slotted.default);
  			appendNode(p_1, content._slotted.default);
  			appendNode(text_8, p_1);
  			appendNode(a, p_1);
  			appendNode(text_10, p_1);
  			appendNode(text_11, content._slotted.default);
  			content._mount(target, anchor);
  			insertNode(text_12, target, anchor);
  			showcase._mount(target, anchor);
  		},

  		p: function update(changed, state) {
  			var showcase_changes = {};
  			if (changed.showcaseData) showcase_changes.type = state.showcaseData.type;
  			showcase._set(showcase_changes);
  		},

  		u: function unmount() {
  			navigation._unmount();
  			detachNode(text);
  			content._unmount();
  			detachNode(text_12);
  			showcase._unmount();
  		},

  		d: function destroy$$1() {
  			navigation.destroy(false);
  			content.destroy(false);
  			showcase.destroy(false);
  		}
  	};
  }

  function PageWeb(options) {
  	init(this, options);
  	this._state = assign(data$4(), options.data);

  	if (!options.root) {
  		this._oncreate = [];
  		this._beforecreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment$5(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(PageWeb.prototype, proto);

  /* src/components/Home.html generated by Svelte v1.64.1 */

  function data$5() {
  	return {};
  }
  function create_main_fragment$6(component, state) {
  	var div;

  	return {
  		c: function create() {
  			div = createElement("div");
  			div.innerHTML = "<main role=\"main\" class=\"site-grid\"><aside class=\"ui-block -padded -flat\" id=\"sidebar\"><div class=\"ui-block -flat -center\"><svg class=\"logo -home\" viewBox=\"0 0 340 340\" xmlns=\"http://www.w3.org/2000/svg\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"1.5\"><g transform=\"scale(.26508 .42412)\"><path fill=\"none\" d=\"M0 0h1280v800H0z\"></path><clipPath id=\"a\"><path d=\"M0 0h1280v800H0z\"></path></clipPath><g clip-path=\"url(#a)\"><g transform=\"matrix(9.35314 0 0 5.84571 -1976.19 -1287.25)\"><circle cx=\"279.713\" cy=\"288.631\" r=\"68.426\"></circle><clipPath id=\"b\"><circle cx=\"279.713\" cy=\"288.631\" r=\"68.426\"></circle></clipPath><g clip-path=\"url(#b)\"><path d=\"M199.874 298.387c36.805-38.879 113.854-24.18 113.02-42.73-.898-19.972-107.796 7.794-32.055 29.407 68.033 19.412-21.036 50.78-28.288 38.527-12.367-20.893 92.572-29.562 125.42-8.168\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4.5\"></path></g></g></g></g></svg></div>\n\n\t\t\t<h1 class=\"ui-heading ui-block -center -padded-b\">Simon Layfield</h1>\n\t\t\t<p>I'm a digital designer from Nottingham UK, designing brands and products that excite, compel and reassure. I'm currently undergoing an Illustration MA at Nottingham Trent University.</p>\n\t\t\t<p>Personal projects include <a href=\"http://typereel.io/\" target=\"_blank\" class=\"link\">Typereel</a> and <a href=\"http://thevoidgenerator.eu-4.evennode.com/\">Pictory</a>.</p>\n\t\t\t<p>If you'd like to join forces or straight up hire me to do design things then please <a href=\"mailto:si%6D%6Fn%6Cay%66ield@protonmai%6C.com\">get in touch</a>.</p>\n\n\t\t\t<div class=\"ui-collection -center -small -spaced _margin-t-max\"><div class=\"item\"><a href=\"https://www.instagram.com/simonlayfield/\"><svg class=\"_subtle\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path d=\"M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z\"></path></svg></a></div>\n\t\t\t\t<div class=\"item\"><a href=\"https://twitter.com/simonevery\"><svg class=\"_subtle\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z\"></path></svg></a></div></div></aside>\n\t\t<section class=\"ui-block -flat\"><div class=\"portfolio-grid\"><div class=\"project\"><a href=\"/project?id=pictory\" class=\"link\"><img src=\"./assets/img/portfolio/void.jpg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>Pictory</strong>\n\t\t\t\t\t\t\tMA Project</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=taru-ajak\" class=\"link\"><img src=\"./assets/img/portfolio/tribe.jpg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>The Taru Ajak</strong>\n\t\t\t\t\t\t\tMA Project</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=from-persia-with-love\" class=\"link\"><img src=\"./assets/img/portfolio/from-persia-with-love-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>From Persia with Love</strong>\n\t\t\t\t\t\t\tBranding</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=monic\" class=\"link\"><img src=\"./assets/img/portfolio/monic-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>Monic</strong>\n\t\t\t\t\t\t\tBranding/Product Design</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=avmaths\" class=\"link\"><img src=\"./assets/img/portfolio/avmaths-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>AvMaths</strong>\n\t\t\t\t\t\t\tBranding/App Concepts</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=k-nit\" class=\"link\"><img src=\"./assets/img/portfolio/knit-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>K-nit</strong>\n\t\t\t\t\t\t\tBranding/Product Design</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=artful\" class=\"link\"><img src=\"./assets/img/portfolio/artful-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>The Artful Press</strong>\n\t\t\t\t\t\t\tBranding/Design</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=about-and-out\" class=\"link\"><img src=\"./assets/img/portfolio/about-and-out.jpg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>About &amp; Out</strong>\n\t\t\t\t\t\t\tIllustration</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=nathan-sheehy\" class=\"link\"><img src=\"./assets/img/portfolio/ns-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>Nathan Sheehy</strong>\n\t\t\t\t\t\t\tBranding</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"https://ractive.js.org/\" class=\"link\" target=\"_blank\"><img src=\"./assets/img/portfolio/ractive-logo.jpg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>Ractive JS</strong>\n\t\t\t\t\t\t\tBranding</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"http://typereel.io\" target=\"_blank\" class=\"link\"><img src=\"./assets/img/portfolio/typereel-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>Typereel</strong>\n\t\t\t\t\t\t\tBranding/FE Development</div></a></div>\n\t\t\t\t<div class=\"project\"><a href=\"/project?id=zombie-friends\" class=\"link\"><img src=\"./assets/img/portfolio/zf-logo.svg\" alt=\"\" class=\"thumbnail\">\n\t\t\t\t\t\t<div class=\"ui-overlay -fallback\"><strong>Zombie Friends</strong>\n\t\t\t\t\t\t\tIllustration</div></a></div></div></section></main>";
  			this.h();
  		},

  		h: function hydrate() {
  			div.className = "ui-container";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  		},

  		p: noop,

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  function Home(options) {
  	init(this, options);
  	this._state = assign(data$5(), options.data);

  	this._fragment = create_main_fragment$6(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);
  	}
  }

  assign(Home.prototype, proto);

  /* src/components/App.html generated by Svelte v1.64.1 */

  function Page(page) {
  	if (page === 'branding') return PageBranding;
  	if (page === 'illustration') return PageIllustration;
  	if (page === 'home') return Home;
  	return PageWeb;
  }

  function data$6() {
  	return {
  		page: webpage
  	};
  }
  function create_main_fragment$7(component, state) {
  	var switch_instance_anchor;

  	var switch_value = state.Page;

  	function switch_props(state) {
  		return {
  			root: component.root
  		};
  	}

  	if (switch_value) {
  		var switch_instance = new switch_value(switch_props(state));
  	}

  	return {
  		c: function create() {
  			switch_instance_anchor = createComment();
  			if (switch_instance) switch_instance._fragment.c();
  		},

  		m: function mount(target, anchor) {
  			insertNode(switch_instance_anchor, target, anchor);

  			if (switch_instance) {
  				switch_instance._mount(target, anchor);
  			}
  		},

  		p: function update(changed, state) {
  			if (switch_value !== (switch_value = state.Page)) {
  				if (switch_instance) switch_instance.destroy();

  				if (switch_value) {
  					switch_instance = new switch_value(switch_props(state));
  					switch_instance._fragment.c();
  					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
  				}
  			}
  		},

  		u: function unmount() {
  			detachNode(switch_instance_anchor);
  			if (switch_instance) switch_instance._unmount();
  		},

  		d: function destroy$$1() {
  			if (switch_instance) switch_instance.destroy(false);
  		}
  	};
  }

  function App(options) {
  	init(this, options);
  	this._state = assign(data$6(), options.data);
  	this._recompute({ page: 1 }, this._state);

  	if (!options.root) {
  		this._oncreate = [];
  		this._beforecreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment$7(this, this._state);

  	if (options.target) {
  		this._fragment.c();
  		this._mount(options.target, options.anchor);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(App.prototype, proto);

  App.prototype._recompute = function _recompute(changed, state) {
  	if (changed.page) {
  		if (this._differs(state.Page, state.Page = Page(state.page))) changed.Page = true;
  	}
  };

  var AppComponent = new App({
  	target: document.querySelector('.app')
  });

}());
