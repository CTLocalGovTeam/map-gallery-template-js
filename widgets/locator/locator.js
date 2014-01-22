/*global define, document, Modernizr */
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
        "dojo/dom-style",
        "dojo/dom-attr",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/text!./templates/locatorTemplate.html",
        "dojo/i18n!nls/localizedStrings",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/Deferred",
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/dom-class",
        "dojo/query",
        "dojo/dom-geometry"
    ],
    function (declare, domStyle, domAttr, lang, on, template, nls, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Deferred, domConstruct, topic, domClass, query, domGeom) {

        //========================================================================================================================//

        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,
            lastSearchString: null,
            stagedSearch: null,
            mapPoint: null,

            /**
            * display locator widget
            *
            * @class
            * @name widgets/locator/locator
            */
            postCreate: function () {
                /**
                * close locator widget if any other widget is opened
                * @param {string} widget Key of the newly opened widget
                */
                this.own(on(this.domNode, "click", lang.hitch(this, function () {

                    /**
                    * minimize other open header panel widgets and show locator widget
                    */
                    topic.publish("toggleWidget", "locator");
                })));
                topic.subscribe("clearDefaultText", this._clearDefaultText);
                topic.subscribe("replaceDefaultText", this._replaceDefaultText);
                domStyle.set(this.divAddressContainer, "display", "block");
                this._setDefaultTextboxValue();
                this.txtItemSearch.value = domAttr.get(this.txtItemSearch, "defaultItem");
                this._attachItemSearchEvents();
            },

            _attachItemSearchEvents: function () {
                this.own(on(this.itemSearchIcon, "click", lang.hitch(this, function (evt) {
                    if (this.txtItemSearch.value != '') {
                        if (this.txtItemSearch.value != dojo.configData.LocatorSettings.itemsLocator[0].LocatorPlaceholder) {
                            this._clearFilter(false);
                            this._locateItems(this.autoResults, true);
                        }
                    }
                })));
                this.own(on(this.txtItemSearch, "keyup", lang.hitch(this, function (evt) {
                    this._submitSearchedItem(evt);
                })));
                this.own(on(this.txtItemSearch, "dblclick", lang.hitch(this, function (evt) {
                    this._clearDefaultText(evt);
                })));
                this.own(on(this.divAddressContainer, "blur", lang.hitch(this, function (evt) {
                    domClass.replace(this.autoResults, "displayNoneAll", "displayBlockAll");
                })));
                this.own(on(this.hideText, "click", lang.hitch(this, function (evt) {
                    this._hideText();
                })));
            },

            /**
            * search address on every key press
            * @param {object} evt Keyup event
            * @memberOf widgets/locator/locator
            */
            _submitSearchedItem: function (evt) {
                if (evt) {
                    if (evt.keyCode == dojo.keys.ENTER) {
                        if (this.txtItemSearch.value != '') {
                            if (this.txtItemSearch.value != dojo.configData.LocatorSettings.itemsLocator[0].LocatorPlaceholder) {
                                this._clearFilter(false);
                                this._locateItems(this.autoResults, true);
                            }
                        }
                    }
                    if (dojo.configData.ApplicationSettings.enableAutoComplete) {

                        /**
                        * do not perform auto complete search if alphabets,
                        * numbers,numpad keys,comma,ctl+v,ctrl +x,delete or
                        * backspace is pressed
                        */
                        if ((!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) || (evt.keyCode == 86 && evt.ctrlKey) || (evt.keyCode == 88 && evt.ctrlKey)) {
                            evt.cancelBubble = true;
                            evt.stopPropagation && evt.stopPropagation();
                            return;
                        }
                        if (lang.trim(this.txtItemSearch.value) != '') {
                            if (this.lastSearchString != lang.trim(this.txtItemSearch.value)) {
                                this.lastSearchString = lang.trim(this.txtItemSearch.value);
                                var _self = this;

                                /**
                                * clear any staged search
                                */
                                clearTimeout(this.stagedSearch);
                                if (lang.trim(this.txtItemSearch.value).length > 0) {

                                    /**
                                    * stage a new search, which will launch if no new searches show up
                                    * before the timeout
                                    */
                                    this.stagedSearch = setTimeout(function () {
                                        _self._locateItems(_self.autoResults, false);
                                    }, 500);
                                }
                            }
                        } else {
                            this.lastSearchString = lang.trim(this.txtItemSearch.value);
                            domConstruct.empty(this.autoResults);
                            domClass.replace(this.autoResults, "displayNoneAll", "displayBlockAll");
                        }
                    }
                }
            },

            _hideText: function () {
                this.txtItemSearch.value = dojo.configData.LocatorSettings.itemsLocator[0].LocatorPlaceholder;
                this.lastSearchString = lang.trim(this.txtItemSearch.value);
                if (domGeom.position(this.autoResults).h > 0) {
                    domClass.replace(this.autoResults, "displayNoneAll", "displayBlockAll");
                }
                this._clearFilter(true);
            },

            _locateItems: function (node, flag) {
                var _self = this;
                var queryString = dojo.queryString;
                var defObj = new Deferred();
                dojo.queryString = this.txtItemSearch.value + ' AND group:("' + dojo.configData.ApplicationSettings.group + '")';
                topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                defObj.then(function (data) {
                    domConstruct.empty(_self.autoResults);
                    if (data.results.length > 0) {
                        domClass.replace(_self.autoResults, "displayBlockAll", "displayNoneAll");
                        for (var i in data.results) {
                            this.spanResults = domConstruct.create('div', { "innerHTML": data.results[i].title }, node);
                            domAttr.set(this.spanResults, "searchedItem", data.results[i].id);
                            _self.own(on(this.spanResults, "click", function () {
                                var itemId = domAttr.get(this, "searchedItem");
                                var defObj = new Deferred();
                                dojo.queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")' + ' AND (id: ("' + itemId + '"))';
                                topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                                defObj.then(function (data) {
                                    dojo.results = data.results;
                                    topic.publish("createPods", data.results, true);
                                    domClass.replace(query(".esriCTShowMoreResults")[0], "displayNoneAll", "displayBlockAll");
                                });
                                domAttr.set(_self.txtItemSearch, "value", this.innerHTML);
                                domAttr.set(_self.txtItemSearch, "defaultItem", this.innerHTML);
                                domConstruct.empty(_self.autoResults);
                                domClass.replace(_self.autoResults, "displayNoneAll", "displayBlockAll");
                            }));
                        }
                        if (flag) {
                            dojo.nextQuery = data.nextQueryParams;
                            dojo.results = data.results;
                            domClass.replace(_self.autoResults, "displayNoneAll", "displayBlockAll");
                            topic.publish("createPods", data.results, true);
                        }
                    } else {
                        dojo.queryString = queryString;
                        _self._locatorErrBack();
                    }
                }, function (err) {
                    alert(err.message);
                });
            },

            /**
            * display error message if query does not return any results
            * @memberOf widgets/locator/locator 
            */
            _locatorErrBack: function () {
                if (domClass.contains(this.autoResults, "displayBlockAll") && (lang.trim(this.txtItemSearch.value) == this.lastSearchString)) {
                    domClass.replace(this.autoResults, "displayNoneAll", "displayBlockAll");
                } else {
                    domClass.replace(this.autoResults, "displayBlockAll", "displayNoneAll");
                }
                this.spanErrResults = domConstruct.create('div', { "class": "esriCTCursorDefault", "innerHTML": nls.errorMessages.invalidSearch }, this.autoResults);
            },

            _clearFilter: function (flag) {
                topic.publish("showProgressIndicator");
                if (query(".esriCTTagCloudHighlight")[0]) {
                    domClass.remove(query(".esriCTTagCloudHighlight")[0], "esriCTTagCloudHighlight");
                }
                if (query(".esriCTDetailsLeftPanel")[0]) {
                    domClass.replace(query(".esriCTMenuTabRight")[0], "displayBlockAll", "displayNoneAll");
                    domClass.add(query(".esriCTDetailsLeftPanel")[0], "displayNoneAll");
                    domClass.add(query(".esriCTDetailsRightPanel")[0], "displayNoneAll");
                    domClass.remove(query(".esriCTGalleryContent")[0], "displayNoneAll");
                    domClass.remove(query(".esriCTInnerRightPanel")[0], "displayNoneAll");
                }
                if (query(".esriCTNoResults")[0]) {
                    domConstruct.destroy(query(".esriCTNoResults")[0]);
                }
                dojo.configData.AGOLItemSettings.searchString = '';
                dojo.configData.AGOLItemSettings.searchType = '';

                if (flag) {
                    var defObj = new Deferred();
                    dojo.queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")';
                    topic.publish("queryGroupItem", dojo.queryString, dojo.sortBy, dojo.configData.AGOLItemSettings.sortOrder.toLowerCase(), defObj);
                    defObj.then(function (data) {
                        dojo.nextQuery = data.nextQueryParams;
                        dojo.results = data.results;
                        topic.publish("createPods", data.results, true);
                    }, function (err) {
                        alert(err.message);
                        topic.publish("hideProgressIndicator");
                    });
                } else {
                    topic.publish("hideProgressIndicator");
                }
            },
            /**
            * clear default value from search textbox
            * @param {object} evt Dblclick event
            * @memberOf widgets/locator/locator
            */
            _clearDefaultText: function (evt) {
                var target = window.event ? window.event.srcElement : evt ? evt.target : null;
                if (!target) return;
                domStyle.set(target, "color", "#000");
                target.value = '';
            },
            /**
            * set default value to search textbox
            * @param {object} evt Blur event
            * @memberOf widgets/locator/locator
            */
            _replaceDefaultText: function (evt) {
                var target = window.event ? window.event.srcElement : evt ? evt.target : null;
                if (!target) return;
                this._resetTargetValue(target, "defaultItem");
            },
            /**
            * set default value to search textbox
            * @param {object} target Textbox dom element
            * @param {string} title Default value
            * @param {string} color Background color of search textbox
            * @memberOf widgets/locator/locator
            */
            _resetTargetValue: function (target, title) {
                if (target.value == '' && domAttr.get(target, title)) {
                    domAttr.set(target, "value", domAttr.get(target, title));
                    if (target.title == "") {
                        target.value = domAttr.get(target, title);
                    }
                }
                if (domClass.contains(target, "esriCTColorChange")) {
                    domClass.remove(target, "esriCTColorChange");
                }
                domClass.add(target, "esriCTBlurColorChange");
            },
            /**
            * set default value of locator textbox as specified in configuration file
            * @param {array} dojo.configData.LocatorSettings.Locators Locator settings specified in configuration file
            * @memberOf widgets/locator/locator
            */
            _setDefaultTextboxValue: function () {
                var itemLocatorSettings = dojo.configData.LocatorSettings.itemsLocator;
                /**
                * txtAddress Textbox for search text
                * @member {textbox} txtAddress
                * @private
                * @memberOf widgets/locator/locator
                */
                if (dojo.configData.AGOLItemSettings.searchString) {
                    domAttr.set(this.txtItemSearch, "defaultItem", dojo.configData.AGOLItemSettings.searchString);
                } else {
                    domAttr.set(this.txtItemSearch, "defaultItem", itemLocatorSettings[0].LocatorPlaceholder);
                }
            }
        });
    });