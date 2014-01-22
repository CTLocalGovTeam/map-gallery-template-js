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
        "dojo/text!./templates/PortalSignin.html",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "esri/arcgis/Portal",
        "dojo/topic",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/i18n!nls/localizedStrings",
        "widgets/leftPanel/leftPanel",
        "dojo/query",
        "dojo/on",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-class",
        "dojo/dom-style",
        "esri/request"
    ],
    function (declare, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, portal, topic, lang, Deferred, nls, leftPanelContent, query, on, domConstruct, domAttr, domClass, domStyle, esriRequest) {

        //========================================================================================================================//

        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            templateString: template,
            nls: nls,

            postCreate: function () {
                domAttr.set(this.signInLabel, "innerHTML", nls.signInText);
                this.createPortal().then(lang.hitch(this, function () {
                    this.queryGroup().then(lang.hitch(this, function () {
                        topic.subscribe("queryGroupItem", dojo.hitch(this._portal, this.queryGroupForItems));
                        topic.subscribe("queryItemInfo", dojo.hitch(this._portal, this.queryItemInfo));
                        var leftPanelObj = new leftPanelCollection();
                    }));
                }));
                this.own(on(this.signInContainer, "click", lang.hitch(this, function () {
                    var defObj = new Deferred();
                    this.portalSignIn(defObj);
                    defObj.then(function () {
                        if (query(".esriCTGalleryContent")[0]) {
                            domConstruct.destroy(query(".esriCTGalleryContent")[0]);
                        }
                        var leftPanelObj = new leftPanelCollection();
                    }, function (err) {
                        alert(err.message);
                    });
                })));
            },

            createPortal: function () {
                var def = new Deferred();
                // create portal
                this._portal = new portal.Portal(dojo.configData.ApplicationSettings.portalURL);
                // portal loaded
                this.own(on(this._portal, "Load", function () {
                    def.resolve();
                }));
                return def;
            },

            queryGroup: function () {
                var _self = this;
                var def = new Deferred();
                // query group info
                _self.queryAGOLGroupInfo({
                    // Settings
                    id_group: dojo.configData.ApplicationSettings.group
                }).then(function (data) {
                    if (data) {
                        if (data.results.length > 0) {
                            // set group content
                            _self.setGroupContent(data.results[0]);
                            def.resolve();
                        } else {
                            alert(nls.errorMessages.emptyGroup);
                            def.resolve();
                        }
                    }
                });
                return def;
            },

            setGroupContent: function (groupInfo) {
                // set group id
                if (!dojo.configData.group) {
                    dojo.configData.group = groupInfo.id;
                }
                // Set group title
                if (!dojo.configData.groupTitle) {
                    dojo.configData.groupTitle = groupInfo.title || "";
                }
                // Set group description
                if (!dojo.configData.AGOLItemSettings.groupDescription) {
                    dojo.configData.AGOLItemSettings.groupDescription = groupInfo.description || "";
                }
                // set footer image
                if (!dojo.configData.groupIcon) {
                    dojo.configData.groupIcon = groupInfo.thumbnailUrl || dojoConfig.baseURL + "/themes/images/groupNoImage.png";
                }
            },

            /*------------------------------------*/
            // query arcgis group info
            /*------------------------------------*/
            queryAGOLGroupInfo: function (obj) {
                var _self = this;
                var def = new Deferred();
                // default values
                var settings = {
                    // set group id for web maps
                    id_group: '',
                    // format
                    dataType: 'json'
                };
                // If options exist, lets merge them with our default settings
                if (obj) {
                    lang.mixin(settings, obj);
                }
                setTimeout(function () {
                    if (query(".dijitDialogPaneContentArea")[0]) {
                        query(".dijitDialogPaneContentArea")[0].childNodes[0].innerHTML = nls.signInDialogText;
                    }
                    if (query(".esriIdSubmit")[0]) {
                        _self.own(on(query(".esriIdSubmit")[0], "click", lang.hitch(this, function () {
                            if (lang.trim(query(".dijitInputInner")[0].value) == "" && lang.trim(query(".dijitInputInner")[1].value) == "") {
                                domAttr.set(query(".esriErrorMsg")[0], "innerHTML", nls.errorMessages.emptyUsernamePassword);
                                domStyle.set(query(".esriErrorMsg")[0], "display", "block");
                            }
                        })));
                    }
                }, 1000);
                // first, request the group to see if it's public or private
                esriRequest({
                    // group rest URL
                    url: dojo.configData.ApplicationSettings.portalURL + '/sharing/rest/community/groups/' + settings.id_group,
                    content: {
                        'f': settings.dataType
                    },
                    callbackParamName: 'callback',
                    load: function (response) {
                        // sign-in flag
                        var signInRequired = (response.access !== 'public') ? true : false;
                        // if sign-in is required
                        if (signInRequired) {
                            _self.portalSignIn().then(function () {
                                // query
                                var q = 'id:"' + settings.id_group + '"';
                                var params = {
                                    q: q,
                                    v: dojo.configData.arcgisRestVersion,
                                    f: settings.dataType
                                };
                                _self._portal.queryGroups(params).then(function (data) {
                                    def.resolve(data);
                                });
                            });
                        } else {
                            // query
                            var q = 'id:"' + settings.id_group + '"';
                            var params = {
                                q: q,
                                v: 1,
                                f: settings.dataType
                            };
                            _self._portal.queryGroups(params).then(function (data) {
                                def.resolve(data);
                            });
                        }
                    },
                    error: function (response) {
                        topic.publish("hideProgressIndicator");
                        def.resolve();
                    }
                });
                return def;
            },

            queryGroupForItems: function (queryString, sortfields, sortorder, deferedObj, nextQuery) {
                var params;
                if (!nextQuery) {
                    params = {
                        q: queryString,
                        num: 100, //should be in number format ex: 100
                        sortField: sortfields, //should be in string format with comma separated values ex: "created"
                        sortOrder: sortorder //should be in string format ex: desc
                    };
                } else {
                    params = nextQuery;
                }
                this.queryItems(params).then(function (data) {
                    deferedObj.resolve(data);
                });
                return deferedObj;
            },

            queryItemInfo: function (itemUrl, defObj) {
                esriRequest({
                    url: itemUrl,
                    callbackParamName: "callback",
                    timeout: 20000,
                    load: function (data) {
                        defObj.resolve(data);
                    },
                    error: function (e) {
                        defObj.resolve();
                        alert(e.message);
                        topic.publish("hideProgressIndicator");
                    }
                });
                return defObj;
            },

            portalSignIn: function (def) {
                var _self = this;
                if (!def) {
                    def = new Deferred();
                }
                if (query(".signin")[0].innerHTML == nls.signInText) {
                    _self._portal.signIn().then(function (loggedInUser) {
                        if (loggedInUser) {
                            if (!dojo.configData.ApplicationSettings.token) {
                                dojo.configData.ApplicationSettings.token = loggedInUser.credential.token;
                            }
                            domAttr.set(query(".signin")[0], "innerHTML", nls.signOutText);
                            domClass.replace(query(".esriCTSignInIcon")[0], "icon-logout", "icon-login");
                            _self.globalUser = loggedInUser;
                            def.resolve();
                        }
                    });
                } else {
                    _self._portal.signOut().then(function (loggedInUser) {
                        if (dojo.configData.ApplicationSettings.token) {
                            dojo.configData.ApplicationSettings.token = null;
                        }
                        domAttr.set(query(".signin")[0], "innerHTML", nls.signInText);
                        domClass.replace(query(".esriCTSignInIcon")[0], "icon-login", "icon-logout");
                        _self.globalUser = null;
                        var queryString = 'group:("' + dojo.configData.ApplicationSettings.group + '")' + ' AND (access: ("' + "public" + '"))';
                        topic.publish("queryGroupItems", null, queryString);
                        def.resolve();
                    });
                }
                setTimeout(function () {
                    if (query(".dijitDialogPaneContentArea")[0]) {
                        query(".dijitDialogPaneContentArea")[0].childNodes[0].innerHTML = nls.signInDialogText;
                    }
                    if (query(".esriIdSubmit")[0]) {
                        _self.own(on(query(".esriIdSubmit")[0], "click", lang.hitch(this, function () {
                            if (lang.trim(query(".dijitInputInner")[0].value) == "" && lang.trim(query(".dijitInputInner")[1].value) == "") {
                                domAttr.set(query(".esriErrorMsg")[0], "innerHTML", nls.errorMessages.emptyUsernamePassword);
                                domStyle.set(query(".esriErrorMsg")[0], "display", "block");
                            }
                        })));
                    }
                }, 1000);
                return def;
            }
        });
    });