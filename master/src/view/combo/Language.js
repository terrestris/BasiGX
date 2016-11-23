/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
 * Combo for changing the language of a BasiGX based application out of a list
 * of predefined languages on-the-fly.
 *
 * @example <caption>Basic usage:</caption>
 * {
 *     xtype: 'basigx-combo-language'
 * }
 *
 * The config object of this component can be adapted to the surrounding
 * environment, where you want to set the preselected language, available
 * languages and the path template to the language files.
 *
 * * @example <caption>Real world usage:</caption>
 * {
 *     xtype: 'basigx-combo-language',
 *     config: {
 *         defaultLanguage: 'en',
 *         languages: [{
 *             code: 'de',
 *             name: 'DE'
 *         }, {
 *             code: 'en',
 *             name: 'EN'
 *         }],
 *         appLocaleUrlTpl: './resources/locale/app-locale-{0}.json'
 *     }
 * }
 *
 * <b>Important:</b> The language file must be a valid JSON file following the
 * syntax stated below (Remove the comments in your language file):
 *
 * <code>
 * {
 *     // full class name of the component
 *     "BasiGX.view.button.AddWms": {
 *         "config": {
 *             // the viewModel object containing the language strings
 *             "data": {
 *                 "tooltip": "Open Add-WMS tool",
 *                 "text": "WMS",
 *                 "windowTitle": "Add WMS"
 *             }
 *         }
 *     }
 * }
 * </code>
 *
 * The file must be named as configured in the appLocaleUrlTpl config, where
 * the placeholder {0} is to be replaced with the language code given in the
 * languages config, e.g. app-locale-en.json.
 *
 * @class BasiGX.view.combo.Language
 */
Ext.define('BasiGX.view.combo.Language', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'basigx-combo-language',
    requires: [
    ],

    viewModel: {
        data: {
            fieldLabel: null
        }
    },

    bind: {
       fieldLabel: '{fieldLabel}'
    },

    /**
     *
     */
    fields: ['code', 'name'],

    /**
     *
     */
    queryMode: 'local',

    /**
     *
     */
    displayField: 'name',

    /**
     *
     */
    valueField: 'code',

    /**
     *
     */
    autoSelect: true,

    /**
     *
     */
    forceSelection: true,

    /**
     *
     */
    editable: false,

    /**
     *
     */
    grow: true,

    /**
     *
     */
    privates: {
        locale: null
    },

    /**
     *
     */
    config: {
        defaultLanguage: 'de',
        languages: [{
            code: 'de',
            name: 'DE'
        }, {
            code: 'en',
            name: 'EN'
        }, {
            code: 'fr',
            name: 'FR'
        }],
        appLocaleUrlTpl: './resources/locale/app-locale-{0}.json'
    },

    /**
     *
     */
    initComponent: function() {
        var me = this;

        // set the the config according to any given config option
        me.setConfig(me.config);

        me.store = Ext.create('Ext.data.Store', {
            sorters: [{
                property: 'code',
                direction: 'DESC'
            }],
            data: me.getLanguages()
        });

        me.callParent(arguments);

        me.on({
            change: me.onLanguageChange
        });

        me.setValue(me.getDefaultLanguage());

    },

    /**
     *
     */
    onLanguageChange: function(combo, newValue) {
        var me = this;
        if (!Ext.isEmpty(newValue)) {
            me.requestLanguageFile(newValue);
        }
    },

    /**
     *
     */
    requestLanguageFile: function(locale) {
        var me = this;
        var appLocaleUrl = Ext.util.Format.format(
                me.getAppLocaleUrlTpl(), locale);

        me.locale = locale;

        Ext.Ajax.request({
            method: 'GET',
            url: appLocaleUrl,
            success: me.onLoadAppLocaleSuccess,
            failure: me.onLoadAppLocaleFailure,
            scope: me
        });
    },

    /**
     *
     */
    onLoadAppLocaleSuccess: function(resp) {
        var me = this;
        var respObj;

        if (resp && resp.responseText) {

            // try to parse the given string as JSON
            try {
                respObj = Ext.decode(resp.responseText);
                Ext.Logger.info('Succesfully loaded i18n file: ' + me.locale);
            } catch(err) {
                me.onLoadAppLocaleFailure();
                return false;
            } finally {
                if (respObj) {
                    me.setAppLanguage(respObj);
                    me.recreateSingletons();
                }
            }
        }
    },

    /**
     *
     */
    onLoadAppLocaleFailure: function() {
        var me = this;
        var defaultLanguage = me.getDefaultLanguage();

        if (me.locale === defaultLanguage) {
            me.erroneousTryToLoadDefaultLanguage = true;
        }

        // load default language, but try only once to prevent killswitch
        if (!me.erroneousTryToLoadDefaultLanguage) {
            Ext.Logger.warn('Error on loading the selected i18n file! Will ' +
                    'try to load the default language ' + defaultLanguage +
                    ' instead.');
            me.requestLanguageFile(defaultLanguage);
        } else {
            Ext.Logger.error('٩(͡๏̯͡๏)۶ Could neither load the selected nor ' +
                    'the fallback i18n file! Bad front-end behaviour is to ' +
                    'be expected.');
        }
    },

    /**
     *
     */
    setAppLanguage: function(localeObj) {
        var me = this;
        var cq = Ext.ComponentQuery.query;
        var cqTpl = '{self.getName() === "{0}"}{getViewModel()}';
        var instantiatedClasses;
        var baseLocaleObj;

        Ext.iterate(localeObj, function(className, locale) {
            baseLocaleObj = {
                override: className
            };

            Ext.iterate(locale, function(key, value) {
                baseLocaleObj[key] = value;
            });

            // 1. override the class itself
            Ext.define(className + '.locale.' + me.locale, baseLocaleObj);

            // 2. Now we will handle the classes viewmodel, if exisiting.
            // The override has to be based on the unmodified classname in
            // this case
            var currentClass = Ext.ClassManager.get(className);
            if (currentClass && currentClass.getConfigurator) {
                var configurator = currentClass.getConfigurator();
                if (configurator && configurator.values &&
                    configurator.values.viewModel) {
                    var viewModel = configurator.values.viewModel;
                    var type = viewModel.type;
                    // if the component has an own viewModel instance
                    if (!Ext.isEmpty(type) || Ext.isString(viewModel)) {
                        var viewName = type || viewModel;
                        var viewClassName = Ext.ClassManager.getName(
                                Ext.ClassManager
                                    .getByAlias('viewmodel.' + viewName));
                        baseLocaleObj.override = viewClassName;
                        Ext.define(viewClassName, baseLocaleObj);
                    } else if (!Ext.isEmpty(viewModel)) {
                        // if the component has an inline viewModel
                        Ext.apply(viewModel.data, locale.config.data);
                    }
                }
            }

            // 3. override the classes already instantiated
            // get all instantiated classes (containing a view model)
            instantiatedClasses = cq(Ext.String.format(cqTpl, className));
            // set the locale for each class
            Ext.each(instantiatedClasses, function(clazz) {
                clazz.getViewModel().setData(locale.config.data);
            });
        });
    },

    /**
     *
     */
    recreateSingletons: function() {
        Ext.MessageBox = Ext.Msg = new Ext.window.MessageBox();
    }
});
