/* Copyright (c) 2017-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Demonstration Utility class
 *
 * Some methods to interactively show the usage of different classes.
 *
 * @class BasiGX.util.Demonstration
 */
Ext.define('BasiGX.util.Demonstration', {

    statics: {

        /**
         * Starts the live demonstration mode for a specific component.
         @example:
             BasiGX.util.Demonstration.demo(
                 someExtComponentLikeAButton,
                 [{
                      moveMouseTo: {
                          component: 'basigx-button-addwms',
                          moveDuration: 2000
                      }
                  },
                  {
                      clickOnButton: 'basigx-button-addwms'
                  },
                  {
                      moveMouseTo:
                          'window[name=add-wms-window] textfield[name=url]'
                  },
                  {
                      enterText: {
                          component:
                              'window[name=add-wms-window] textfield[name=url]',
                          text: 'https://ows.terrestris.de/osm/service',
                          waitAfter: 3500
                      }
                  },
                  {
                      destroy: 'window[name=add-wms-window]'
                  }
              ]);
         *
         * @param {Object} origin An Ext.Component from which the action starts
         * @param {Array} liveDemoConfig The configuration Array which holds
         *     Objects with information on how to demonstrate the functionality
         */
        demo: function(origin, liveDemoConfig) {
            // show an absolute positioned demo mouse cursor at the origin
            var imgBox = Ext.create('Ext.container.Container', {
                renderTo: Ext.getBody(),
                height: 20,
                width: 20,
                items: [
                    {
                        xtype: 'image',
                        src: 'resources/img/cursor_30x52.png',
                        width: 30,
                        height: 52
                    }
                ],
                x: origin.getX(),
                y: origin.getY()
            });

            var el = imgBox.el;
            // make sure we are always on top...
            el.setZIndex(99999);

            // start the demonstration chain
            BasiGX.util.Demonstration.handleAnimationChain(
                liveDemoConfig, el, 0
            );
        },

        /**
         * Iterates through the liveDemoConfig object and calls the given
         * functions to show the usage of a component.
         *
         * @param {Array} liveDemoConfig The configuration Array which holds
         *     Objects with information on how to demonstrate the functionality
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         * @param {Integer} index The current index of the animation chain
         *     in order to determine which step is the next one
         */
        handleAnimationChain: function(liveDemoConfig, el, index) {
            var conf = liveDemoConfig[index];
            var next = liveDemoConfig[index + 1];
            if (conf) {
                Ext.iterate(conf, function(key, value) {
                    if (Ext.isDefined(
                            window['BasiGX']['util']['Demonstration'][key])) {
                        window['BasiGX']['util']['Demonstration'][key](
                            value, el, index, liveDemoConfig
                        );
                        if (next) {
                            var waitAfter = value.waitAfter || 500;
                            var duration = value.moveDuration || 500;
                            var delayTime = waitAfter + duration;
                            var task = new Ext.util.DelayedTask(function() {
                                index++;
                                BasiGX.util.Demonstration.handleAnimationChain(
                                    liveDemoConfig, el, index
                                );
                            });
                            task.delay(delayTime);
                        } else {
                            BasiGX.util.Demonstration.endDemo(el);
                        }
                    } else {
                        BasiGX.util.Demonstration.cancelDemo(el);
                        return;
                    }
                });
            } else {
                BasiGX.util.Demonstration.endDemo(el);
            }
        },

        /**
         * Gets the Ext.Component based on the given identifier
         *
         * @param {String/Object} value Can be either the components
         *     identifier string or an object holding the string in the
         *     key `component`
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         * @return {Object} The Ext.Component which was found
         */
        getComponent: function(value, el) {
            var queryString;
            if (value.component && Ext.isString(value.component)) {
                queryString = value.component;
            } else if (Ext.isString(value)) {
                queryString = value;
            }
            var component = Ext.ComponentQuery.query(queryString)[0];
            if (!component) {
                BasiGX.util.Demonstration.cancelDemo(el);
            } else {
                return component;
            }
        },

        /**
         * Cancel the demo and give and show an Error Message that something
         * went wrong
         *
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         */
        cancelDemo: function(el) {
            BasiGX.util.Demonstration.endDemo(el);
            Ext.Msg.alert(
                'Error', 'Sorry, the demo seems to be broken.');
            return;
        },

        /**
         * End the demo by removing the demo mouse cursor
         *
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         */
        endDemo: function(el) {
            var task = new Ext.util.DelayedTask(function() {
                el.destroy();
            });
            task.delay(1000);
        },

        /**
         * Moves the mouse to the given component. A duration in milliseconds
         * can be given to set the animation duration
         *
          * @param {String/Object} value Can be either the components
         *     identifier string or an object holding the string in the
         *     key `component`. When an Object is given, it may also contain
         *     a key `moveDuration` to set the animation duration
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         */
        moveMouseTo: function(value, el) {
            var component = BasiGX.util.Demonstration.getComponent(value, el);
            var moveDuration = value.moveDuration || 1000;
            el.animate({
                duration: moveDuration,
                to: {
                    x: component.getX() + (component.getWidth() / 2),
                    y: component.getY() + (component.getHeight() / 2)
                }
            });
        },

        /**
         * Used to click on an Ext.button.Button
         *
         * @param {String/Object} value Can be either the components
         *     identifier string or an object holding the string in the
         *     key `component`
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         */
        clickOnButton: function(value, el) {
            var component = BasiGX.util.Demonstration.getComponent(value, el);
            var wasTogglable = component.enableToggle;
            // visually press the button
            component.enableToggle = true;
            component.toggle(false);
            component.toggle(true);
            // trigger the click
            component.handler(component);
            var task = new Ext.util.DelayedTask(function() {
                component.toggle(false);
                if (!wasTogglable) {
                    component.enableToggle = false;
                }
            });
            task.delay(500);
        },

        /**
         * Enters a text in a given component by calling the `setValue` method.
         * The typing of single letters is delayed, therefore the duration
         * depends on the length of the text to be typed. When calling this
         * method it makes sense to also set the `waitAfter` key in the `value`
         * object to something useful
         *
         * @param {Object} value An object holding the identifier string in the
         *     key `component` and the text to enter in the `text` key
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         * @param {Integer} index The current index of the animation chain
         *     in order to determine which step is the next one
         */
        enterText: function(value, el) {
            var component = BasiGX.util.Demonstration.getComponent(value, el);
            // first erase old values
            component.setValue('');
            var runner = new Ext.util.TaskRunner();
            var i = 0;

            var task = runner.newTask({
                run: function() {
                    component.setValue(value.text.substring(0, i + 1));
                    i++;
                },
                interval: 100,
                repeat: value.text.length
            });
            task.start();
        },

        /**
         * Scrolls a scrollable component to the given coordinates
         *
         * @param {Object} value An object holding the identifier string in the
         *     key `component` and the target information in the `target` key.
         *     The `target` object contains the coordinates as `x` and `y` and
         *     the boolean flag `animate` to indicate if we shall animate
         *     the scroll
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         */
        scrollTo: function(value, el) {
            var component = BasiGX.util.Demonstration.getComponent(value, el);
            component.scrollTo(
                value.target.x,
                value.target.y,
                value.target.animate
            );
        },

        /**
         * Used to destroy a component by the given identifier
         *
         * @param {String/Object} value Can be either the components
         *     identifier string or an object holding the string in the
         *     key `component`
         * @param {Object} el The Ext.element which represents the demo
         *     mouse cursor
         */
        destroy: function(value, el) {
            var component = BasiGX.util.Demonstration.getComponent(value, el);
            if (component) {
                component.destroy();
            }
        }
    }
});
