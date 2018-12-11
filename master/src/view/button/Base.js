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
 * A base class for buttons.
 *
 * @class BasiGX.view.button.Base
 */
Ext.define('BasiGX.view.button.Base', {
    extend: 'Ext.Button',
    xtype: 'basigx-button-base',
    viewModel: {
        data: {}
    },
    bind: {},
    /**
     *
     */
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        if (me.setTooltip) {
            var bind = me.config.bind;
            var ttFromViewModel = me.getViewModel().get('tooltip');
            if (ttFromViewModel) {
                bind.tooltip = ttFromViewModel;
            }
            me.setBind(bind);
        }
    }
});
