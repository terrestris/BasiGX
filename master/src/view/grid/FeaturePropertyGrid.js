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
        propertyWhiteList: null
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
        // Equal to editabel: false. Which does not exist.
        me.on('beforeedit', function(){
            return false;
        });
    },

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
            displayValues[property] = me.getOlFeature().get(property);
        });

        if(displayValues){
            me.setSource(displayValues);
        } else {
            Ext.Error.raise('Feature in FeaturePropertyGrid has no values.');
        }
    }

});
