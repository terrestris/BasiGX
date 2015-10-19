/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
Ext.define('BasiGX.util.Controller', {

    statics: {
        /**
         * This method creates methdos on the passed controller, which call
         * their pendant on the associated view when they are invoked. This was
         * needed for the component.Map (BasiGX). See a controller
         * that works on this class for more details (the bfs-koala project
         * has such an example)
         *
         * @param {String[]} methodNames Array of function names to borrow from
         *     the view.
         * @param {Ext.Class} controllerCls The controller class which we'll
         *     change and extend.
         */
        borrowViewMethods: function(methodNames, controllerCls) {
            var controllerProto = controllerCls.prototype;
            Ext.each(methodNames, function(methodName) {
                if (!Ext.isDefined(controllerProto[methodName])) {
                    controllerProto[methodName] = function() {
                        var view = this.getView();
                        var viewMethod = view[methodName];
                        if (viewMethod) {
                            viewMethod.apply(view, arguments);
                        }
                    };
                }
            });
        }
    }
});
