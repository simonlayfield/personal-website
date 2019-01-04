(function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function noop() {}

  function assign(target) {
  	var k,
  	    source,
  	    i = 1,
  	    len = arguments.length;
  	for (; i < len; i++) {
  		source = arguments[i];
  		for (k in source) {
  			target[k] = source[k];
  		}
  	}

  	return target;
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

  function setAttribute(node, attribute, value) {
  	node.setAttribute(attribute, value);
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
  				}).concat(program.name + ' ' + duration + 'ms linear 1 forwards').join(', ');
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
  			return anim.slice(0, name.length) !== name;
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

  function differs(a, b) {
  	return a !== b || a && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' || typeof a === 'function';
  }

  function dispatchObservers(component, group, changed, newState, oldState) {
  	for (var key in group) {
  		if (!changed[key]) continue;

  		var newValue = newState[key];
  		var oldValue = oldState[key];

  		var callbacks = group[key];
  		if (!callbacks) continue;

  		for (var i = 0; i < callbacks.length; i += 1) {
  			var callback = callbacks[i];
  			if (callback.__calling) continue;

  			callback.__calling = true;
  			callback.call(component, newValue, oldValue);
  			callback.__calling = false;
  		}
  	}
  }

  function fire(eventName, data) {
  	var handlers = eventName in this._handlers && this._handlers[eventName].slice();
  	if (!handlers) return;

  	for (var i = 0; i < handlers.length; i += 1) {
  		handlers[i].call(this, data);
  	}
  }

  function get$1(key) {
  	return key ? this._state[key] : this._state;
  }

  function init(component, options) {
  	component._observers = { pre: blankObject(), post: blankObject() };
  	component._handlers = blankObject();
  	component._bind = options._bind;

  	component.options = options;
  	component.root = options.root || component;
  	component.store = component.root.store || options.store;
  }

  function observe(key, callback, options) {
  	var group = options && options.defer ? this._observers.post : this._observers.pre;

  	(group[key] || (group[key] = [])).push(callback);

  	if (!options || options.init !== false) {
  		callback.__calling = true;
  		callback.call(this, this._state[key]);
  		callback.__calling = false;
  	}

  	return {
  		cancel: function cancel() {
  			var index = group[key].indexOf(callback);
  			if (~index) group[key].splice(index, 1);
  		}
  	};
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
  		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
  	}
  	if (!dirty) return;

  	this._state = assign({}, oldState, newState);
  	this._recompute(changed, this._state);
  	if (this._bind) this._bind(changed, this._state);

  	if (this._fragment) {
  		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
  		this._fragment.p(changed, this._state);
  		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
  	}
  }

  function callAll(fns) {
  	while (fns && fns.length) {
  		fns.shift()();
  	}
  }

  function _mount(target, anchor) {
  	this._fragment.m(target, anchor);
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
  	_unmount: _unmount
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

  /* src/components/Navigation.html generated by Svelte v1.54.2 */

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

  function create_main_fragment(state, component) {
  	var header, nav, text, header_class_value;

  	var menu = state.menu;

  	var each_blocks = [];

  	for (var i = 0; i < menu.length; i += 1) {
  		each_blocks[i] = create_each_block(state, menu, menu[i], i, component);
  	}

  	var if_block = state.submenuItems.length && create_if_block_2(state, component);

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
  			var menu = state.menu;

  			if (changed.menu) {
  				for (var i = 0; i < menu.length; i += 1) {
  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, state, menu, menu[i], i);
  					} else {
  						each_blocks[i] = create_each_block(state, menu, menu[i], i, component);
  						each_blocks[i].c();
  						each_blocks[i].m(nav, text);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = menu.length;
  			}

  			if (state.submenuItems.length) {
  				if (if_block) {
  					if_block.p(changed, state);
  				} else {
  					if_block = create_if_block_2(state, component);
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
  function create_each_block(state, menu, menuItem, index, component) {
  	var text, if_block_1_anchor;

  	var if_block = menuItem.url && create_if_block(state, menu, menuItem, index, component);

  	var if_block_1 = !menuItem.url && create_if_block_1(state, menu, menuItem, index, component);

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

  		p: function update(changed, state, menu, menuItem, index) {
  			if (menuItem.url) {
  				if (if_block) {
  					if_block.p(changed, state, menu, menuItem, index);
  				} else {
  					if_block = create_if_block(state, menu, menuItem, index, component);
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
  					if_block_1.p(changed, state, menu, menuItem, index);
  				} else {
  					if_block_1 = create_if_block_1(state, menu, menuItem, index, component);
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
  function create_if_block(state, menu, menuItem, index, component) {
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

  		p: function update(changed, state, menu, menuItem, index) {
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
  function create_if_block_1(state, menu, menuItem, index, component) {
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
  			button.className = "link";
  			addListener(button, "click", click_handler);

  			button._svelte = {
  				component: component,
  				menu: menu,
  				index: index
  			};
  		},

  		m: function mount(target, anchor) {
  			insertNode(button, target, anchor);
  			appendNode(text, button);
  		},

  		p: function update(changed, state, menu, menuItem, index) {
  			if (changed.menu && text_value !== (text_value = menuItem.label)) {
  				text.data = text_value;
  			}

  			button._svelte.menu = menu;
  			button._svelte.index = index;
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
  function create_each_block_1(state, submenuItems, submenuItem, submenuItem_index, component) {
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

  		p: function update(changed, state, submenuItems, submenuItem, submenuItem_index) {
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
  function create_if_block_2(state, component) {
  	var nav, nav_transition, introing, outroing;

  	var submenuItems = state.submenuItems;

  	var each_blocks = [];

  	for (var i = 0; i < submenuItems.length; i += 1) {
  		each_blocks[i] = create_each_block_1(state, submenuItems, submenuItems[i], i, component);
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
  			var submenuItems = state.submenuItems;

  			if (changed.submenuItems) {
  				for (var i = 0; i < submenuItems.length; i += 1) {
  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, state, submenuItems, submenuItems[i], i);
  					} else {
  						each_blocks[i] = create_each_block_1(state, submenuItems, submenuItems[i], i, component);
  						each_blocks[i].c();
  						each_blocks[i].m(nav, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = submenuItems.length;
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
  	var menu = this._svelte.menu,
  	    index = this._svelte.index,
  	    menuItem = menu[index];
  	component.processMenuItemClick(index);
  }

  function Navigation(options) {
  	init(this, options);
  	this._state = assign(data(), options.data);

  	if (!options.root) {
  		this._oncreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);

  		callAll(this._aftercreate);
  	}
  }

  assign(Navigation.prototype, methods, proto);

  /* src/components/Content.html generated by Svelte v1.54.2 */

  function create_main_fragment$1(state, component) {
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

  	this._fragment = create_main_fragment$1(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);
  	}
  }

  assign(Content.prototype, proto);

  /* src/components/Showcase.html generated by Svelte v1.54.2 */

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
  function encapsulateStyles(node) {
  	setAttribute(node, "svelte-3470831650", "");
  }

  function add_css() {
  	var style = createElement("style");
  	style.id = 'svelte-3470831650-style';
  	style.textContent = "[svelte-3470831650].-simple,[svelte-3470831650] .-simple,[svelte-3470831650].-detailed,[svelte-3470831650] .-detailed{width:100%;display:grid;grid-template-columns:1fr;grid-gap:30px}[svelte-3470831650].-simple .ui-card,[svelte-3470831650] .-simple .ui-card{box-shadow:none}[svelte-3470831650].-mosaic,[svelte-3470831650] .-mosaic{-moz-column-count:1;-moz-column-gap:20px;-webkit-column-count:1;-webkit-column-gap:20px;column-count:1;column-gap:20px;text-align:center}[svelte-3470831650].-mosaic img,[svelte-3470831650] .-mosaic img{margin-bottom:20px;border-radius:5px}[svelte-3470831650].ui-card__details,[svelte-3470831650] .ui-card__details{border:1px solid #ccc}@media(min-width: 500px){[svelte-3470831650].-simple,[svelte-3470831650] .-simple,[svelte-3470831650].-detailed,[svelte-3470831650] .-detailed{grid-template-columns:repeat(2, 1fr)}[svelte-3470831650].-mosaic,[svelte-3470831650] .-mosaic{-moz-column-count:2;-moz-column-gap:20px;-webkit-column-count:2;-webkit-column-gap:20px;column-count:2}}@media(min-width: 1200px){[svelte-3470831650].-simple,[svelte-3470831650] .-simple,[svelte-3470831650].-detailed,[svelte-3470831650] .-detailed{grid-template-columns:repeat(3, 1fr)}[svelte-3470831650].-mosaic,[svelte-3470831650] .-mosaic{-moz-column-count:3;-moz-column-gap:20px;-webkit-column-count:3;-webkit-column-gap:20px;column-count:3}}[svelte-3470831650].row,[svelte-3470831650] .row{padding-top:2rem;padding-bottom:2rem}[svelte-3470831650].row.-bg,[svelte-3470831650] .row.-bg{background:#f1f1f1}[svelte-3470831650].row.-padded,[svelte-3470831650] .row.-padded{padding-left:1rem;padding-right:1rem}";
  	appendNode(style, document.head);
  }

  function create_main_fragment$2(state, component) {
  	var await_block_anchor, await_block_1, await_block_type, await_token, promise, resolved;

  	function replace_await_block(token, type, value, state) {
  		if (token !== await_token) return;

  		var old_block = await_block_1;
  		await_block_1 = (await_block_type = type)(state, resolved = value, component);

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
  				replace_await_block(token, create_then_block, value, state);
  			}, function (error) {
  				var state = component.get();
  				replace_await_block(token, create_catch_block, error, state);
  			});

  			// if we previously had a then/catch block, destroy it
  			if (await_block_type !== create_pending_block) {
  				replace_await_block(token, create_pending_block, null, state);
  				return true;
  			}
  		} else {
  			resolved = promise;
  			if (await_block_type !== create_then_block) {
  				replace_await_block(token, create_then_block, resolved, state);
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
  				await_block_1.p(changed, state, resolved);
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
  function create_pending_block(state, _, component) {
  	var div;

  	return {
  		c: function create() {
  			div = createElement("div");
  			div.textContent = "loading...";
  			this.h();
  		},

  		h: function hydrate() {
  			encapsulateStyles(div);
  			div.className = "ui-block -center";
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
  function create_each_block$1(state, assets, assets_1, asset, asset_index, component) {
  	var img, img_src_value;

  	return {
  		c: function create() {
  			img = createElement("img");
  			this.h();
  		},

  		h: function hydrate() {
  			img.src = img_src_value = asset.image;
  			img.alt = '';
  		},

  		m: function mount(target, anchor) {
  			insertNode(img, target, anchor);
  		},

  		p: function update(changed, state, assets, assets_1, asset, asset_index) {
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
  function create_each_block_1$1(state, assets, assets_1, asset, asset_index, component) {
  	var div, img, img_src_value;

  	return {
  		c: function create() {
  			div = createElement("div");
  			img = createElement("img");
  			this.h();
  		},

  		h: function hydrate() {
  			img.src = img_src_value = asset.image;
  			img.alt = '';
  			div.className = "ui-card";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  			appendNode(img, div);
  		},

  		p: function update(changed, state, assets, assets_1, asset, asset_index) {
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
  function create_each_block_2(state, assets, assets_1, asset, asset_index, component) {
  	var div,
  	    text,
  	    a,
  	    img,
  	    img_src_value,
  	    a_href_value,
  	    text_2,
  	    div_1,
  	    a_1,
  	    h3,
  	    text_3_value = asset.name,
  	    text_3,
  	    a_1_href_value,
  	    text_5,
  	    p,
  	    raw_value = asset.detail;

  	var current_block_type = select_block_type(state, assets, assets_1, asset, asset_index);
  	var if_block = current_block_type(state, assets, assets_1, asset, asset_index, component);

  	return {
  		c: function create() {
  			div = createElement("div");
  			if_block.c();
  			text = createText("\n\t\t\t\t\t");
  			a = createElement("a");
  			img = createElement("img");
  			text_2 = createText("\n\t\t\t\t\t");
  			div_1 = createElement("div");
  			a_1 = createElement("a");
  			h3 = createElement("h3");
  			text_3 = createText(text_3_value);
  			text_5 = createText("\n\t\t\t\t\t\t");
  			p = createElement("p");
  			this.h();
  		},

  		h: function hydrate() {
  			img.src = img_src_value = asset.image;
  			img.alt = '';
  			a.href = a_href_value = asset.url;
  			a.target = "_blank";
  			h3.className = "ui-heading -tertiary";
  			a_1.href = a_1_href_value = asset.url;
  			a_1.target = "_blank";
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
  			appendNode(a_1, div_1);
  			appendNode(h3, a_1);
  			appendNode(text_3, h3);
  			appendNode(text_5, div_1);
  			appendNode(p, div_1);
  			p.innerHTML = raw_value;
  		},

  		p: function update(changed, state, assets, assets_1, asset, asset_index) {
  			if (current_block_type !== (current_block_type = select_block_type(state, assets, assets_1, asset, asset_index))) {
  				if_block.u();
  				if_block.d();
  				if_block = current_block_type(state, assets, assets_1, asset, asset_index, component);
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
  function create_if_block_3(state, assets, assets_1, asset, asset_index, component) {
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

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  // (33:5) {{else}}
  function create_if_block_4(state, assets, assets_1, asset, asset_index, component) {
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

  		u: function unmount() {
  			detachNode(div);
  		},

  		d: noop
  	};
  }

  // (8:2) {{#if type == "mosaic"}}
  function create_if_block$1(state, assets, component) {
  	var each_anchor;

  	var assets_1 = assets;

  	var each_blocks = [];

  	for (var i = 0; i < assets_1.length; i += 1) {
  		each_blocks[i] = create_each_block$1(state, assets, assets_1, assets_1[i], i, component);
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

  		p: function update(changed, state, assets) {
  			var assets_1 = assets;

  			if (changed.showcaseData) {
  				for (var i = 0; i < assets_1.length; i += 1) {
  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, state, assets, assets_1, assets_1[i], i);
  					} else {
  						each_blocks[i] = create_each_block$1(state, assets, assets_1, assets_1[i], i, component);
  						each_blocks[i].c();
  						each_blocks[i].m(each_anchor.parentNode, each_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = assets_1.length;
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
  function create_if_block_1$1(state, assets, component) {
  	var each_anchor;

  	var assets_1 = assets;

  	var each_blocks = [];

  	for (var i = 0; i < assets_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1$1(state, assets, assets_1, assets_1[i], i, component);
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

  		p: function update(changed, state, assets) {
  			var assets_1 = assets;

  			if (changed.showcaseData) {
  				for (var i = 0; i < assets_1.length; i += 1) {
  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, state, assets, assets_1, assets_1[i], i);
  					} else {
  						each_blocks[i] = create_each_block_1$1(state, assets, assets_1, assets_1[i], i, component);
  						each_blocks[i].c();
  						each_blocks[i].m(each_anchor.parentNode, each_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = assets_1.length;
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
  function create_if_block_2$1(state, assets, component) {
  	var each_anchor;

  	var assets_1 = assets;

  	var each_blocks = [];

  	for (var i = 0; i < assets_1.length; i += 1) {
  		each_blocks[i] = create_each_block_2(state, assets, assets_1, assets_1[i], i, component);
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

  		p: function update(changed, state, assets) {
  			var assets_1 = assets;

  			if (changed.showcaseData) {
  				for (var i = 0; i < assets_1.length; i += 1) {
  					if (each_blocks[i]) {
  						each_blocks[i].p(changed, state, assets, assets_1, assets_1[i], i);
  					} else {
  						each_blocks[i] = create_each_block_2(state, assets, assets_1, assets_1[i], i, component);
  						each_blocks[i].c();
  						each_blocks[i].m(each_anchor.parentNode, each_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].u();
  					each_blocks[i].d();
  				}
  				each_blocks.length = assets_1.length;
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

  // (55:2) {{else}}
  function create_if_block_5(state, assets, component) {
  	var p;

  	return {
  		c: function create() {
  			p = createElement("p");
  			p.textContent = "No items found";
  		},

  		m: function mount(target, anchor) {
  			insertNode(p, target, anchor);
  		},

  		p: noop,

  		u: function unmount() {
  			detachNode(p);
  		},

  		d: noop
  	};
  }

  // (3:0) {{then assets}}
  function create_then_block(state, assets, component) {
  	var div, div_1, div_1_class_value, div_class_value;

  	var current_block_type = select_block_type_1(state, assets);
  	var if_block = current_block_type(state, assets, component);

  	return {
  		c: function create() {
  			div = createElement("div");
  			div_1 = createElement("div");
  			if_block.c();
  			this.h();
  		},

  		h: function hydrate() {
  			encapsulateStyles(div);
  			div_1.className = div_1_class_value = "ui-container -" + state.type + " -padded";
  			div.className = div_class_value = "row " + (state.type == 'detailed' ? '-bg' : '') + " -padded";
  		},

  		m: function mount(target, anchor) {
  			insertNode(div, target, anchor);
  			appendNode(div_1, div);
  			if_block.m(div_1, null);
  		},

  		p: function update(changed, state, assets) {
  			if (current_block_type === (current_block_type = select_block_type_1(state, assets)) && if_block) {
  				if_block.p(changed, state, assets);
  			} else {
  				if_block.u();
  				if_block.d();
  				if_block = current_block_type(state, assets, component);
  				if_block.c();
  				if_block.m(div_1, null);
  			}

  			if (changed.type && div_1_class_value !== (div_1_class_value = "ui-container -" + state.type + " -padded")) {
  				div_1.className = div_1_class_value;
  			}

  			if (changed.type && div_class_value !== (div_class_value = "row " + (state.type == 'detailed' ? '-bg' : '') + " -padded")) {
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

  // (64:0) {{catch theError}}
  function create_catch_block(state, theError, component) {
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
  			encapsulateStyles(p);
  		},

  		m: function mount(target, anchor) {
  			insertNode(p, target, anchor);
  			appendNode(text, p);
  			appendNode(text_1, p);
  		},

  		p: function update(changed, state, theError) {
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

  function select_block_type(state, assets, assets_1, asset, asset_index) {
  	if (asset.type === 'commercial') return create_if_block_3;
  	return create_if_block_4;
  }

  function select_block_type_1(state, assets) {
  	if (state.type == "mosaic") return create_if_block$1;
  	if (state.type == "simple") return create_if_block_1$1;
  	if (state.type == "detailed") return create_if_block_2$1;
  	return create_if_block_5;
  }

  function Showcase(options) {
  	init(this, options);
  	this._state = assign(data$1(), options.data);
  	this._recompute({ dataUrl: 1 }, this._state);

  	if (!document.getElementById("svelte-3470831650-style")) add_css();

  	this._fragment = create_main_fragment$2(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);
  	}
  }

  assign(Showcase.prototype, proto);

  Showcase.prototype._recompute = function _recompute(changed, state) {
  	if (changed.dataUrl) {
  		if (differs(state.showcaseData, state.showcaseData = showcaseData(state.dataUrl))) changed.showcaseData = true;
  	}
  };

  /* src/components/PageBranding.html generated by Svelte v1.54.2 */

  function data$2() {
  	return {};
  }
  function create_main_fragment$3(state, component) {
  	var text, text_1, h1, text_2, text_3, p, text_4, text_5, text_6, text_7;

  	var navigation = new Navigation({
  		root: component.root
  	});

  	var content = new Content({
  		root: component.root,
  		slots: { default: createFragment() }
  	});

  	var showcase = new Showcase({
  		root: component.root,
  		data: {
  			type: "simple",
  			dataUrl: "/js/branding.json"
  		}
  	});

  	var showcase_1 = new Showcase({
  		root: component.root,
  		data: {
  			type: "mosaic",
  			dataUrl: "/js/mockups.json"
  		}
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

  	this._fragment = create_main_fragment$3(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(PageBranding.prototype, proto);

  /* src/components/PageIllustration.html generated by Svelte v1.54.2 */

  function data$3() {
  	return {
  		showcaseData: {
  			type: "mosaic"
  		}
  	};
  }
  function create_main_fragment$4(state, component) {
  	var text, text_1, h1, text_2, text_3, p, text_4, p_1, text_5, a, text_7, text_8, text_9;

  	var navigation = new Navigation({
  		root: component.root
  	});

  	var content = new Content({
  		root: component.root,
  		slots: { default: createFragment() }
  	});

  	var showcase = new Showcase({
  		root: component.root,
  		data: {
  			type: state.showcaseData.type,
  			dataUrl: "/js/illustration.json"
  		}
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

  	this._fragment = create_main_fragment$4(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(PageIllustration.prototype, proto);

  /* src/components/PageWeb.html generated by Svelte v1.54.2 */

  function data$4() {
  	return {
  		showcaseData: {
  			type: "detailed"
  		}
  	};
  }
  function create_main_fragment$5(state, component) {
  	var text, text_1, h1, text_2, text_3, p, text_4, em, text_6, text_7, p_1, text_8, a, text_10, text_11, text_12;

  	var navigation = new Navigation({
  		root: component.root
  	});

  	var content = new Content({
  		root: component.root,
  		slots: { default: createFragment() }
  	});

  	var showcase = new Showcase({
  		root: component.root,
  		data: {
  			type: state.showcaseData.type,
  			dataUrl: "/js/web.json"
  		}
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

  	this._fragment = create_main_fragment$5(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(PageWeb.prototype, proto);

  /* src/components/Home.html generated by Svelte v1.54.2 */

  function data$5() {
  	return {};
  }
  function create_main_fragment$6(state, component) {
  	var text, div;

  	var navigation = new Navigation({
  		root: component.root,
  		data: { version: "home" }
  	});

  	return {
  		c: function create() {
  			navigation._fragment.c();
  			text = createText("\n");
  			div = createElement("div");
  			div.innerHTML = "<main role=\"main\" class=\"ui-block\"><div class=\"ui-block -center\"><svg width=\"180px\" viewBox=\"0 0 146 136\" xmlns=\"http://www.w3.org/2000/svg\" fill-rule=\"evenodd\" clip-rule=\"evenodd\" stroke-linejoin=\"round\" stroke-miterlimit=\"1.414\"><g transform=\"matrix(1.07268 0 0 .99844 -289.99 -9.538)\"><path fill=\"#fff\" d=\"M270.341 9.553h136v136h-136z\"></path><clipPath id=\"a\"><path d=\"M270.341 9.553h136v136h-136z\"></path></clipPath><g clip-path=\"url(#a)\"><g transform=\"matrix(0 -1.18605 1.10396 0 255.672 475.675)\"><circle cx=\"335.672\" cy=\"74.884\" r=\"57.333\" fill=\"#4d00f1\"></circle><clipPath id=\"b\"><circle cx=\"335.672\" cy=\"74.884\" r=\"57.333\"></circle></clipPath><g clip-path=\"url(#b)\"><path d=\"M70.518 888.559l-8.593 8.593-14.728-14.727c-.819-.87-.966-1.186-1.241-1.797-.902-1.998-.622-4.475.739-6.227.2-.257.261-.312.483-.55l38.214-38.56a6.451 6.451 0 0 1 4.656-1.79c2.868.248 3.117.939 3.937 1.751 2.079 2.06 2.332 5.712.523 8.042-.2.258-.261.313-.484.552l-33.956 34.263 10.45 10.45z\" fill=\"url(#_Linear3)\" fill-rule=\"nonzero\" transform=\"matrix(0 .84445 -.84445 0 1078.02 -1.45)\"></path><path d=\"M108.905 867.358l8.593-8.593 14.805 14.805c.773.821.844 1.015 1.084 1.473 1.08 2.058.847 4.727-.597 6.571-.202.257-.263.312-.487.549L93.916 920.55c-3.807 3.584-12.049.157-10.098-6.104.279-.896.475-1.395 1.505-2.489l34.09-34.091-10.508-10.508z\" fill=\"url(#_Linear4)\" fill-rule=\"nonzero\" transform=\"matrix(0 .84445 -.84445 0 1078.02 -1.45)\"></path><path d=\"M316.768 61.706a4.024 4.024 0 0 1-.191-.204c-1.577-1.78-1.67-4.69-.199-6.566.17-.218.222-.264.41-.465l3.63-3.628 7.256 7.257 28.788 28.787c.103.11.202.222.295.339.288.322.543.713.755 1.184.299.662.48 1.028.445 2.357l-.002.059v.01a5.55 5.55 0 0 1-1.492 3.309l-3.63 3.627-7.256-7.256-28.788-28.788-.02-.022z\" fill=\"#fff\" fill-rule=\"nonzero\"></path></g></g></g></g><defs><linearGradient id=\"_Linear3\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"rotate(45 -1036.174 509.76) scale(14.2267)\"><stop offset=\"0\" stop-color=\"#fff\"></stop><stop offset=\"1\" stop-color=\"#4d00f1\"></stop></linearGradient><linearGradient id=\"_Linear4\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\" gradientUnits=\"userSpaceOnUse\" gradientTransform=\"scale(-15.3038) rotate(45 64.861 -38.34)\"><stop offset=\"0\" stop-color=\"#fff\"></stop><stop offset=\"1\" stop-color=\"#4d00f1\"></stop></linearGradient></defs></svg></div>\n\t\t<section class=\"ui-block -flat\"><h1 class=\"ui-heading -primary -center\">Hello, I'm Simon Layfield</h1>\n\t\t\t<p class=\"ui-callout\">I design and build meaningful user experiences into lightweight, scalable web prototypes using frontend technologies like <a href=\"https://svelte.technology\" target=\"_blank\">Svelte</a> and <a href=\"https://rollupjs.org/guide/en\" target=\"_blank\">Rollup</a>.</p>\n\t\t\t<p>Currently, my free time in this area goes towards my personal project, <a href=\"http://typereel.io/\" target=\"_blank\" class=\"link\">Typereel</a>.</p>\n\t\t\t<div class=\"ui-block -center\"><hr class=\"ui-separator\"></div>\n\t\t\t<p class=\"ui-callout -small\">Other interests include freelance <a href=\"./branding.html\" class=\"link\">design</a> and <a href=\"./illustration.html\" class=\"link\">illustration</a>, I co-run an online board game shop called <a href=\"http://www.rollersboardgames.com\" class=\"link\">Rollers</a> and play in a band called <a href=\"https://www.facebook.com/youthandtheyoung/\" target=\"_blank\" class=\"link\">Youth &amp; The Young</a>.</p></section></main>";
  			this.h();
  		},

  		h: function hydrate() {
  			div.className = "ui-container -slim -padded-w";
  		},

  		m: function mount(target, anchor) {
  			navigation._mount(target, anchor);
  			insertNode(text, target, anchor);
  			insertNode(div, target, anchor);
  		},

  		p: noop,

  		u: function unmount() {
  			navigation._unmount();
  			detachNode(text);
  			detachNode(div);
  		},

  		d: function destroy$$1() {
  			navigation.destroy(false);
  		}
  	};
  }

  function Home(options) {
  	init(this, options);
  	this._state = assign(data$5(), options.data);

  	if (!options.root) {
  		this._oncreate = [];
  		this._beforecreate = [];
  		this._aftercreate = [];
  	}

  	this._fragment = create_main_fragment$6(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);

  		this._lock = true;
  		callAll(this._beforecreate);
  		callAll(this._oncreate);
  		callAll(this._aftercreate);
  		this._lock = false;
  	}
  }

  assign(Home.prototype, proto);

  /* src/components/App.html generated by Svelte v1.54.2 */

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
  function create_main_fragment$7(state, component) {
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
  			if (switch_instance) switch_instance._mount(target, anchor);
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

  	this._fragment = create_main_fragment$7(this._state, this);

  	if (options.target) {
  		this._fragment.c();
  		this._fragment.m(options.target, options.anchor || null);

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
  		if (differs(state.Page, state.Page = Page(state.page))) changed.Page = true;
  	}
  };

  var AppComponent = new App({
  	target: document.querySelector('.app')
  });

}());
