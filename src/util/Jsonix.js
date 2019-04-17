/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 * Common utility class containing static methods for determination,
 * initialization and storing of Jsonix components.
 *
 * @class BasiGX.util.Jsonix
 */
Ext.define('BasiGX.util.Jsonix', {
    inheritableStatics: {
        jsonixContext: null,
        marshaller: null,
        unmarshaller: null,
        possibleGlobals: [
            'Jsonix',
            'Filter_1_0_0',
            'SLD_1_0_0',
            'SMIL_2_0',
            'SMIL_2_0_Language',
            'GML_2_1_2',
            'GML_3_1_1',
            'XLink_1_0',
            'WPS_1_0_0',
            'OWS_1_1_0',
            'WCS_1_1'
        ],
        /**
         * Create instances of Jsonix classes and make them accessible as static
         * properties.
         *
         */
        setStaticJsonixReferences: function() {
            var staticMe = BasiGX.util.Jsonix;
            var availableGlobals = [];
            Ext.each(staticMe.possibleGlobals, function(possible) {
                if (!(possible in window)) {
                    Ext.Logger.warn(
                        'Possible global variable "' +
                        possible + '" not found. ' +
                        'This functionality will not be available!'
                    );
                } else {
                    availableGlobals.push(window[possible]);
                }
            });
            // create the objects…
            var context = new Jsonix.Context(
                availableGlobals, {
                    namespacePrefixes: {
                        'http://www.opengis.net/sld': 'sld',
                        "http://www.opengis.net/ogc": "ogc",
                        "http://www.opengis.net/gml": "gml",
                        "http://www.w3.org/2001/XMLSchema-instance": "xsi",
                        "http://www.w3.org/1999/xlink": "xlink",
                        "http://www.opengis.net/ows/1.1": "ows",
                        "http://www.opengis.net/wps/1.0.0": "wps",
                        "http://www.opengis.net/wcs/1.1.1": "wcs"
                    }
                });
            var marshaller = context.createMarshaller();
            var unmarshaller = context.createUnmarshaller();
            // … and store them in the static variables.
            staticMe.jsonixContext = context;
            staticMe.marshaller = marshaller;
            staticMe.unmarshaller = unmarshaller;
        }
    }
}, function() {
    BasiGX.util.Jsonix.setStaticJsonixReferences();
});
