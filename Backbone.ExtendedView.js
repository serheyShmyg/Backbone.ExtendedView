/**
 * Backbone extended view
 * Version 0.0.1
 */
(function(w, BB) {
    if (!BB) {
        return false;
    }

    /**
     * Extended backbone view
     * @param {Object} [data] Path data for template
     */
    var viewName = 'ExtendedView',
        BackboneView = BB.View,
        View = BackboneView.extend({
            /**
             * Compile engine is here
             * @param {String} template
             * @param {Object} data
             * @returns {String} Compiled template string
             */
            /*templating: function(template, data) {
                template = Handlebars.compile(template);
                return template(data);
            },*/

            constructor: function(options) {
                this.options = _.extend({}, _.result(this, 'options'), options);
                Backbone.View.call(this, this.options);
            },

            bindUIElements: function() {
                var self = this,
                    bindings;

                if (!self.ui) {
                    return;
                }

                if (!self._uiBindings) {
                    self._uiBindings = self.ui;
                }

                bindings = _.result(self, '_uiBindings');
     
                self.ui = {};

                _.each(bindings, function(selector, key) {
                    self.ui[key] = self.$(selector);
                }, self);

                return self;
            },

            unbindUIElements: function() {
                var self = this;

                if (!self.ui || !self._uiBindings) {
                    return;
                }

                _.each(self.ui, function($el, name) {
                    delete self.ui[name];
                }, self);
          
                self.ui = self._uiBindings;
                delete self._uiBindings;

                return self;
            },

            /**
             * Render template to any element
             */
            render: function() {
                var self = this,
                    template = self._getTemplate();

                self.trigger('before:render');

                self.$el.html(template);

                self.isRendered = true;

                self.bindUIElements();
                self.bindEvents();

                self.trigger('after:render');

                return self;
            },

            /**
             * Destroy view completely
             */
            destroy: function() {
                var self = this;

                self.trigger('before:destroy');

                self
                    .unbindEvents()
                    .unbindUIElements();

                self.$el.remove();

                //Destroy child views
                _.each(self.childViews, function(value, key) {
                    _.isFunction(value.destroy) && value.destroy();
                });

                self.isRendered = false;

                self.trigger('after:destroy');

                return self;
            },

            /**
             * Render child view into view
             * @param {Function} View constructor
             * @param {Object} [renderOptions]
             * @param {String} [renderOptions.name] What name will take your view into childViews hash
             * @param {String|jQuery} [renderOptions.wrapper] Render view into this element
             * @param {Object} [viewOptions] Additional options for view
             */
            renderChildView: function(View, renderOptions, viewOptions) {
                renderOptions = renderOptions || {};
                viewOptions = viewOptions || {};

                var self = this,
                    view;

                if (!_.isFunction(View)) {
                    return false;
                }

                if (!self.childViews) {
                    self.childViews = {};
                }

                view = new View(viewOptions);
                self.childViews[renderOptions.name || view.cid] = view;

                _.isFunction(view.render) && view.render();

                if (view.$el.length) {
                    !renderOptions.wrapper && self.$el.append(view.$el);
                    renderOptions.wrapper && self.$el.find(renderOptions.wrapper).append(view.$el);
                }

                return this;
            },

            serializeData: function() {
                return _.extend({}, this.options.data || {}, this.data || {});
            },

            /**
             * Unbind all events
             * @param {Object}
             */
            bindEvents: function(eventsArg) {
                var self = this,
                    events = _.extend({}, eventsArg || {}, self.events);

                if (!events) {
                    return false;
                }

                self.unbindEvents();

                events = self._normalizeUIKeys(events);
              
                Backbone.View.prototype.delegateEvents.call(self, events);

                return self;
            },

            /**
             * Unbind all events from `events` param
             */
            unbindEvents: function() {
                Backbone.View.prototype.undelegateEvents.call(this);
                return this;
            },

            _getTemplate: function() {
                var self = this,
                    template;

                if (!self.template) {
                    throw new Error('TemplateUndefined');
                }

                template = !_.isFunction(self.template) ? self.template : self.template();

                if (_.isFunction(self.templating)) {
                    return self.templating(template, self.serializeData());
                }
                
                return template;
            },

            _normalizeUIString: function(uiString, ui) {
                return uiString.replace(/@ui\.[a-zA-Z_$0-9]*/g, function(r) {
                    return ui[r.slice(4)];
                });
            },

            _normalizeUIKeys: function(hash, ui) {
                var self = this,
                    uiBindings = _.result(this, '_uiBindings');
                
                ui = uiBindings || _.result(this, 'ui');

                return _.reduce(hash, function(memo, val, key) {
                    var normalizedKey = self._normalizeUIString(key, ui);
                    memo[normalizedKey] = val;
                    return memo;
                }, {});
            }
        });

    !BB[viewName] && (BB[viewName] = View);
}(window, window.Backbone));