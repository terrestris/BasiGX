/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * HTML 5 - CSV Importer
 *
 * This form is used to import csv files to an Ext-JS Grid. As it uses the HTML5
 * File-Api InternetExplorer < 10 is not supported.
 *
 * Current CSV Requirements:
 *      First Row contains headers.
 *      Seperator is comma.
 *      Strings are in doublequotes.
 *
 * @class BasiGX.view.form.CsvImport
 */
Ext.define('BasiGX.view.form.CsvImport', {
    extend: 'Ext.form.Panel',

    xtype: 'form-csvimport',

    config: {
        grid: null,
        dataArray: null
    },

    /**
     * Initializes the CsvImport form.
     *
     * @param {Object} conf The configuration for the CsvImport form.
     */
    initComponent: function(conf) {
        var me = this;
        me.callParent(conf);
        if (!me.getGrid()) {
            Ext.Error.raise('No grid defined for csv-importer.');
        }
    },

    /**
     * You can put default associations here. These will fill the comboboxes.
     *
     * The `key` represents the csv-column. The `value` represents the grid
     * column text, e.g.:
     *
     *     // …
     *     associatonObject: {
     *         Name: "Nachname",
     *         Vorname: "Vorname",
     *         Straße: null,
     *         Hausnummer: null,
     *         Postleitzahl: null,
     *         Stadt: null,
     *         "E-Mail_1": "E-Mail",
     *         "E-Mail_2": null
     *     },
     *     // …
     */
    associatonObject: {},

    bodyPadding: 10,

    items: [{
        xtype: 'filefield',
        name: 'csv_file',
        fieldLabel: 'CSV-Datei', // TODO i18n
        labelWidth: 70,
        width: 400,
        msgTarget: 'side',
        allowBlank: false,
        buttonText: 'Datei auswählen …', // TODO i18n
        validator: function(val) {
            var fileName = /^.*\.(csv)$/i;
            // TODO i18n
            var errMsg = 'Der Datenimport ist nur mit CSV-Dateien möglich.';
            return fileName.test(val) || errMsg;
        }
    }],

    buttons: [{
        xtype: 'button',
        name: 'importBtn',
        text: 'Importieren', // TODO i18n
        handler: function(btn) {
            var csvImportForm = this.up('form');
            csvImportForm.startImport(btn);
        },
        disabled: true
    }, {
        text: 'Datei einlesen', // TODO i18n
        handler: function() {
            if (window.FileReader) {
                var csvImportForm = this.up('form');
                var fileField = csvImportForm.down('filefield');
                var file = fileField.extractFileInput().files[0];
                var reader = new FileReader();

                reader.readAsText(file);
                reader.onload = csvImportForm.onLoad;
                reader.onerror = csvImportForm.onError;
            } else {
                // TODO i18n
                Ext.Toast('FileReader are not supported in this browser.');
            }
        }
    }],

    /**
     * Bound on the FileReader.load event, this decodes the uploaded file as CSV
     * and calls #setDataArray and #setupAssociations.
     *
     * @param {Object} event The event from the FileReader.
     */
    onLoad: function(event) {
        var csvImportForm = Ext.ComponentQuery.query('form-csvimport')[0];
        var csv = event.target.result;
        var dataArray = Ext.util.CSV.decode(csv);
        csvImportForm.setDataArray(dataArray);

        csvImportForm.setupAssociations(dataArray[0], csvImportForm);

    },

    /**
     * Bound on the FileReader.error event, this warns if a `NotReadableError`
     * occured.
     *
     * @param {Object} evt The event from the FileReader.
     */
    onError: function(evt) {
        if (evt.target.error.name === 'NotReadableError') {
            // TODO i18n
            Ext.toast('Canno\'t read file !');
        }
    },

    /**
     * Sets up associations between CSV and grid columns.
     *
     * @param {Array<String>} titleRow The first row of the CSV (the titles).
     * @param {BasiGX.view.form.CsvImport} csvImportForm The CSV import form.
     */
    setupAssociations: function(titleRow, csvImportForm) {
        var dataModelColumns = csvImportForm.getGrid().query(
            'gridcolumn[hidden=false]'
        );
        var columnTitles = [];
        var assoFieldset = Ext.create('Ext.form.FieldSet', {
            title: 'Felder assoziieren', // TODO i18n
            name: 'assoFieldset',
            layout: 'form',
            scrollable: 'y',
            maxHeight: 300,
            collapsible: true,
            margin: '0 0 30 0'
        });

        Ext.each(dataModelColumns, function(column) {
            columnTitles.push(column.text);
        }, csvImportForm);

        Ext.each(titleRow, function(columnName) {
            assoFieldset.add({
                xtype: 'combobox',
                name: columnName,
                fieldLabel: columnName,
                store: columnTitles,
                value: csvImportForm.associatonObject[columnName],
                msgTarget: 'side'
            });
        }, csvImportForm);

        csvImportForm.down('button[name=importBtn]').enable();

        csvImportForm.add(assoFieldset);
    },

    /**
     * Adds a data array to the grid.
     *
     * @param {Array<Object>} dataArray The CSV rows.
     */
    addToGrid: function(dataArray) {
        var me = this;
        var store = me.getGrid().getStore();

        me.setLoading(true);
        Ext.each(dataArray, function(dataRow, index) {
            if (index > 0) { //skip first row of csv. it contains the header
                var instance = this.parseDataFromRow(dataRow);
                store.add(instance);
            }
        }, me);
        me.setLoading(false);
    },

    /**
     * Turns a data row into a record.
     *
     * @param {Object} dataRow A CSV data row.
     * @return {Ext.data.Model} A created record for the grid.
     */
    parseDataFromRow: function(dataRow) {
        var me = this;
        var data = {};

        Ext.each(dataRow, function(csvColumn, rowIdx) {
            var gridColumText = me.associatonObject[
                me.getDataArray()[0][rowIdx]];
            if (!Ext.isEmpty(csvColumn) && !Ext.isEmpty(gridColumText)) {
                var gridColumn = me.getGrid()
                    .down('gridcolumn[text=' + gridColumText + ']');
                if (gridColumn) {
                    var dataIndex = gridColumn.dataIndex;
                    data[dataIndex] = csvColumn;
                } else {
                    // TODO i18n
                    Ext.Error.raise(gridColumText,
                        ' does not exist. Please check you associationObject.');
                }
            }
        });

        return Ext.create(this.getGrid().getStore().getModel(), data);
    },

    /**
     * Starts the import.
     *
     * @param {Ext.button.Button} btn The button.
     */
    startImport: function(btn) {
        var me = this;
        var combos = btn.up('form').down('fieldset[name=assoFieldset]').
            query('combo');
        var comboValues = [];
        var formValid = true;

        Ext.each(combos, function(combo) {
            var comboVal = combo.getValue();
            if (Ext.Array.contains(comboValues, comboVal) &&
                !Ext.isEmpty(comboVal)) {
                // TODO i18n
                combo.markInvalid('Diese Feld wurde bereits mit einer anderen' +
                    'Spalte asoziert');
                formValid = false;
            } else {
                this.associatonObject[combo.getFieldLabel()] = comboVal;
            }
            comboValues.push(comboVal);
        }, me);

        if (formValid && me.getDataArray()) {
            me.addToGrid(me.getDataArray());
        }

        me.fireEvent('importcomplete', me);
    }
});
