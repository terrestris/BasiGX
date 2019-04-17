/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * Date utility.
 *
 * @class BasiGX.util.Date
 */
Ext.define('BasiGX.util.Date', {
    inheritableStatics: {
        /**
         * Returns a `Date` instance where the date part is taken from the
         * passed `anyDate`, and the time is set to `'23:59:59.999'`.
         *
         * @param {Date} anyDate The date to take the year, month and day from.
         * @return {Date} A date with year, month and day from the input and
         *     the time set to `'23:59:59.999'`.
         */
        latestTimeOfDay: function(anyDate) {
            // clone to get the original year, month and day
            var adjusted = Ext.Date.clone(anyDate);

            // start with 00:00:00.000
            adjusted = Ext.Date.clearTime(adjusted);

            // add hours, minutes etc.
            adjusted = Ext.Date.add(adjusted, Ext.Date.HOUR, 23);
            adjusted = Ext.Date.add(adjusted, Ext.Date.MINUTE, 59);
            adjusted = Ext.Date.add(adjusted, Ext.Date.SECOND, 59);
            adjusted = Ext.Date.add(adjusted, Ext.Date.MILLI, 999);

            return adjusted;
        },

        /**
         * Tries to parse a passed date string into a `Date`-object. Does this
         * by first checking the `Ext.Date.defaultFormat` (i18n-able). In a
         * certain case (en-locale) another date format is checked.
         *
         * @param {String} dateStr A string representing a date, usually in
         *     the format `Ext.Date.defaultFormat`.
         * @return {Date} The parsed date as `Date`-object.
         */
        selectedDateStringToRealDate: function(dateStr) {
            var format = Ext.Date.defaultFormat;
            var parsed = Ext.Date.parse(dateStr, format);
            if (!parsed && format === 'm/d/Y') {
                // Needed for the english locale:
                // Parsing failed, try it with 'm/d/y' and passed value
                // TODO we need find the source of this oddish behaviour
                parsed = Ext.Date.parse(dateStr, 'm/d/y');
            }
            return parsed;
        }
    }

});
