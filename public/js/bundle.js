(function () {
'use strict';

function noop() {}

function assign(target) {
	var k,
	    source,
	    i = 1,
	    len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
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

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d();
	}
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

	while (i--) hash = (hash << 5) - hash ^ str.charCodeAt(i);
	return hash >>> 0;
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
		run: function (intro, callback) {
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
		start: function (program) {
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
		update: function (now) {
			var program = this.program;
			if (!program) return;

			var p = now - program.start;
			this.t = program.a + program.delta * ease(p / program.duration);
			if (obj.tick) obj.tick(this.t);
		},
		done: function () {
			var program = this.program;
			this.t = program.b;
			if (obj.tick) obj.tick(this.t);
			if (obj.css) transitionManager.deleteRule(node, program.name);
			program.callback();
			program = null;
			this.running = !!this.pending;
		},
		abort: function () {
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

	add: function (transition) {
		this.transitions.push(transition);

		if (!this.running) {
			this.running = true;
			requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
		}
	},

	addRule: function (rule, name) {
		if (!this.activeRules[name]) {
			this.activeRules[name] = true;
			this.stylesheet.insertRule('@keyframes ' + name + ' ' + rule, this.stylesheet.cssRules.length);
		}
	},

	next: function () {
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
			while (i--) this.stylesheet.deleteRule(i);
			this.activeRules = {};
		}
	},

	deleteRule: function (node, name) {
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

function _differs(a, b) {
	return a != a ? b == b : a !== b || a && typeof a === 'object' || typeof a === 'function';
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

function get(key) {
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
		cancel: function () {
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
		cancel: function () {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
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
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment.m(target, anchor);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

var proto = {
	destroy: destroy,
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
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
        while (parts.length) array = array[parts.shift()];
        var result = array[name].apply(array, args);
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
		css: function (t) {
			return "overflow: hidden;" + "opacity: " + Math.min(t * 20, 1) * opacity + ";" + "height: " + t * height + "px;" + "padding-top: " + t * paddingTop + "px;" + "padding-bottom: " + t * paddingBottom + "px;" + "margin-top: " + t * marginTop + "px;" + "margin-bottom: " + t * marginBottom + "px;" + "border-top-width: " + t * borderTopWidth + "px;" + "border-bottom-width: " + t * borderBottomWidth + "px;";
		}
	};
}

/* src/components/Navigation.html generated by Svelte v1.56.0 */
function data() {
	return {
		menu: [{
			label: "Home",
			url: "index.html"
		}, {
			label: "Projects",
			submenu: [{
				label: "Web",
				url: "/web"
			}, {
				label: "Branding",
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
	push,
	processMenuItemClick(index) {
		if (this.get('submenuItems').length) {
			this.set({ submenuItems: [] });
		} else {
			let submenu = this.get('menu'),
			    submenuItems = submenu[index].submenu;
			this.set({ submenuItems: submenuItems });
		}
	}
};

function create_main_fragment(component, state) {
	var nav, text;

	var menu = state.menu;

	var each_blocks = [];

	for (var i = 0; i < menu.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign({}, state, {
			menuItem: menu[i],
			index: i
		}));
	}

	var if_block = state.submenuItems.length && create_if_block_2(component, state);

	return {
		c: function create() {
			nav = createElement("nav");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text = createText("\n\t");
			if (if_block) if_block.c();
			this.h();
		},

		h: function hydrate() {
			nav.className = "ui-navigation";
		},

		m: function mount(target, anchor) {
			insertNode(nav, target, anchor);

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
					var each_context = assign({}, state, {
						menuItem: menu[i],
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
				each_blocks.length = menu.length;
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
		},

		u: function unmount() {
			detachNode(nav);

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

// (2:1) {{#each menu as menuItem, index}}
function create_each_block(component, state) {
	var menuItem = state.menuItem,
	    index = state.index;
	var text, if_block_1_anchor;

	var if_block = menuItem.url && create_if_block(component, state);

	var if_block_1 = !menuItem.url && create_if_block_1(component, state);

	return {
		c: function create() {
			if (if_block) if_block.c();
			text = createText("\n\t\t");
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

// (3:2) {{#if menuItem.url}}
function create_if_block(component, state) {
	var menuItem = state.menuItem,
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

// (6:2) {{#if !menuItem.url}}
function create_if_block_1(component, state) {
	var menuItem = state.menuItem,
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
			button.className = "link";
			addListener(button, "click", click_handler);

			button._svelte = {
				component: component,
				menu: state.menu,
				index: state.index
			};
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(text, button);
		},

		p: function update(changed, state) {
			menuItem = state.menuItem;
			index = state.index;
			if (changed.menu && text_value !== (text_value = menuItem.label)) {
				text.data = text_value;
			}

			button._svelte.menu = state.menu;
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

// (12:3) {{#each submenuItems as submenuItem}}
function create_each_block_1(component, state) {
	var submenuItem = state.submenuItem,
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

// (10:1) {{#if submenuItems.length}}
function create_if_block_2(component, state) {
	var nav, nav_transition, introing, outroing;

	var submenuItems = state.submenuItems;

	var each_blocks = [];

	for (var i = 0; i < submenuItems.length; i += 1) {
		each_blocks[i] = create_each_block_1(component, assign({}, state, {
			submenuItem: submenuItems[i],
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
			var submenuItems = state.submenuItems;

			if (changed.submenuItems) {
				for (var i = 0; i < submenuItems.length; i += 1) {
					var each_context = assign({}, state, {
						submenuItem: submenuItems[i],
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

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._aftercreate);
	}
}

assign(Navigation.prototype, methods, proto);

const NavigationComponent = new Navigation({
	target: document.querySelector('.ui-navigation')
});

}());
