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
 * Header Panel
 *
 * Used to show a headerpanel in the viewport.
 * Class usually instanciated in the map container.
 *
 */
Ext.define("BasiGX.view.panel.Header", {
    extend: "Ext.panel.Panel",
    xtype: "basigx-panel-header",

    requires: [
        "Ext.Img"
    ],

    config: {
        addLogo: true,
        logoUrl: 'resources/images/logo.png',
        link: null,
        logoAltText: 'Logo',
        logoHeight: 80,
        logoWidth: 200,
        logoMargin: '0 50px',
        additionalItems: []
    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    padding: 5,

    cls: 'basigx-header',


    items: [],

    /**
    *
    */
    initComponent: function() {
        var me = this;

        // add logo
        if(me.getAddLogo() === true) {
            me.addLogoItem();
        }

        var additionalItems = me.getAdditionalItems();
        // add additional items
        if(!Ext.isEmpty(additionalItems) &&
                Ext.isArray(additionalItems)) {
            Ext.each(additionalItems, function(item) {
                me.items.push(item);
            });
        }

        me.callParent();
    },

    /**
     *
     */
    addLogoItem: function() {
        var me = this;
        var logo = {
            xtype: 'image',
            margin: me.getLogoMargin(),
            alt: me.getLogoAltText(),
            src: me.getLogoUrl(),
            height: me.getLogoHeight(),
            width: me.getLogoWidth(),
            autoEl: {
                tag: 'a',
                href: me.getLink()
            }
        };

        me.items.push(logo);
   },

   /**
    *
    */
   setBackgroundColor: function(color) {
       this.setStyle({
           'background-color': color, //fallback for ie9 and lower
           background: "linear-gradient(to right, white, " + color + ")"
       });
   }
});
