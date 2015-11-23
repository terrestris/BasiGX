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
/**
 * FeaturePropertyGrid
 *
 * A PropertyGrid showing feature values.
 *
 */
Ext.define("BasiGX.view.grid.FeaturePropertyGrid", {
    xtype: "basigx-grid-featurepropertygrid",
    extend: 'Ext.grid.property.Grid',
    requires: [
    ],

    width: 300,

    config: {
        olFeature: null,
        propertyWhiteList: null,
        propertyMapping: null
    },

    /**
     *
     */
    initComponent: function(){
        var me = this;

        if(!me.getOlFeature()){
            Ext.Error.raise('No Feature set for FeaturePropertyGrid.');
        }

        me.callParent([arguments]);
        me.on('afterrender', me.setUpFeatureValues, me);
        // Equal to editable: false. Which does not exist.
        me.on('beforeedit', function(){
            return false;
        });
    },

    /**
     * Prepares the values by handling the property whitelist and mapping
     */
    setUpFeatureValues: function(){
        var me = this;
        var displayValues = {};

        // Enable tooltip
        var valueColumn = me.getColumns()[1];
        valueColumn.renderer = function(value, metadata) {
            metadata.tdAttr = 'data-qtip="' + value + '"';
            return value;
        };

        Ext.each(me.getPropertyWhiteList(), function(property){
            var mappedKey = me.getPropertyMapping() &&
                me.getPropertyMapping()[property];
            var key = mappedKey ? mappedKey : property;
            var val = me.getOlFeature().get(property);
            val = me.convertToHref(val);
            displayValues[key] = val;
        });

        if(displayValues){
            me.setSource(displayValues);
        } else {
            Ext.Error.raise('Feature in FeaturePropertyGrid has no values.');
        }
    },

    /**
     * Method checks if a value looks like a link and converts it to a
     * clickable href
     *
     * @param {Mixed} value - the value to check and convert if needed
     * @return {String} value - the converted html-href string
     */
    convertToHref: function(value) {
        if (!value || !value.indexOf) {
            return value;
        }
        if (value.indexOf("http") === 0) {
            value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
        } else if (value.indexOf("www.") === 0) {
            value = "<a href='http://" + value + "' target='_blank'>" +
                value + "</a>";
        }
        return value;
    }

});
