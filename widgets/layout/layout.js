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
        "dojo/text!./templates/layout.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/i18n!nls/localizedStrings",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/topic",
        "dojo/query",
        "dojo/dom-attr",
        "dojo/dom-geometry",
        "dojo/on"
    ],
    function (declare, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, nls, lang, Deferred, domClass, domStyle, topic, query, domAttr, domGeom, on) {

        //========================================================================================================================//

        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,
            postCreate: function () {
                domAttr.set(this.layoutLabel, "innerHTML", nls.layoutText);
                this.own(on(this.toggleLayout, "click", lang.hitch(this, function () {
                    topic.publish("showProgressIndicator");
                    var numberOfItems;
                    if (!dojo.configData.gridView) {
                        dojo.configData.gridView = true;
                        numberOfItems = 9;
                        domAttr.set(this.layoutTitle, "title", nls.listViewTitle);
                        domClass.replace(this.layoutTitle, "icon-list", "icon-grid");
                    } else {
                        dojo.configData.gridView = false;
                        numberOfItems = 4;
                        domAttr.set(this.layoutTitle, "title", nls.gridViewTitle);
                        domClass.replace(this.layoutTitle, "icon-grid", "icon-list");
                    }
                    var defObj = new Deferred();
                    topic.publish("queryGroupItem", dojo.queryString, numberOfItems, dojo.sortBy, "desc", defObj);
                    defObj.then(function (data) {
                        dojo.nextQuery = data.nextQueryParams;
                        dojo.prevQuery = null;
                        topic.publish("createPods", data.results);
                        if (data.total <= numberOfItems) {
                            domClass.replace(query(".pagination")[0], "displayNoneAll", "displayBlockAll");
                        } else {
                            domClass.replace(query(".pagination")[0], "displayBlockAll", "displayNoneAll");
                        }
                        topic.publish("hideProgressIndicator");
                    }, function (err) {
                        alert(err.message);
                        topic.publish("hideProgressIndicator");
                    });
                })));
            }
        });
    });