/*global dojo,define,document */
/*jslint sloppy:true */
/** @license
| Version 10.2
| Copyright 2013 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License");
| you may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
//============================================================================================================================//
define([
        "dojo/_base/declare",
        "dojo/text!./templates/sortby.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "dojo/query",
        "dojo/_base/lang",
        "dojo/topic",
        "dojo/Deferred",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/on"
    ],
    function (declare, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, query, lang, topic, Deferred, domConstruct, domClass, domAttr, on) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,

            postCreate: function () {
                var flagSortByDate = true;
                domAttr.set(this.sortByLabel, "innerHTML", nls.sortByDateText);
                this.own(on(this.sortByLabel, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    if (flagSortByDate) {
                        flagSortByDate = this._sortByDate(this.sortByLabel, flagSortByDate);
                    } else {
                        flagSortByDate = this._sortByViews(this.sortByLabel, flagSortByDate);
                    }
                })));
                this.own(on(this.sortByViewMbl, "click", lang.hitch(this, function () {
                    flagSortByDate = this._sortByViews(this.sortByLabel, flagSortByDate);
                })));
                this.own(on(this.sortByDateMbl, "click", lang.hitch(this, function () {
                    flagSortByDate = this._sortByDate(this.sortByLabel, flagSortByDate);
                })));
            },

            _sortByDate: function (sortByLabel, flagSortByDate) {
                dojo.sortBy = "modified";
                this._sortPodOrder(dojo.sortBy, sortByLabel, nls.sortByViewText);
                flagSortByDate = false;
                domClass.remove(query(".tickmark")[0], "tickmark");
                domClass.add(query(".sortByDateMbl")[0], "tickmark");
                return flagSortByDate;
            },

            _sortByViews: function (sortByLabel, flagSortByDate) {
                dojo.sortBy = "numViews";
                this._sortPodOrder(dojo.sortBy, sortByLabel, nls.sortByDateText);
                flagSortByDate = true;
                domClass.remove(query(".tickmark")[0], "tickmark");
                domClass.add(query(".sortByViewMbl")[0], "tickmark");
                return flagSortByDate;
            },

            _sortPodOrder: function (sortOrder, sortByLabel, text) {
                var defObj = new Deferred();
                topic.publish("queryGroupItem", dojo.queryString, sortOrder, "desc", defObj);
                defObj.then(function (data) {
                    domAttr.set(sortByLabel, "innerHTML", text);
                    dojo.nextQuery = data.nextQueryParams;
                    topic.publish("createPods", data.results, true, data.total);
                });
            }
        });
    });