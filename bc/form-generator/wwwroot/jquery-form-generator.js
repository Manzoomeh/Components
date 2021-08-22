jQuery.fn.extend({
    formGenerator: function (sourceUrl, destinationUrl, xmlContainer, logContainer, inEditMode, useAjax, options) {
        if (arguments.length == 1) {
            if (arguments[0] == 'submit') {
                $(this).find('.fg-submit-btn').click();
            }
        } else {
            $(this).each(function () {
                formGenerator.init($(this), sourceUrl, destinationUrl, xmlContainer, logContainer, inEditMode, useAjax, options);
            });
        }
        return $(this);
    },
});
/*
step for generate ui:
1 - get xml from sourceUrl in  init function
2 - generate main container in createUIFromXml.if view is edit,main container if form else is table
    2-1 - then iterate in properties collection (property elements) and call generateProperty() methode.
            in this methode create one row for current property and call GenerateAnswers() for create related ui.
            if url set for help,then add help button.
    2-3 - GenerateAnswers() get xml data about each property answers collections and store in property object.
            then create templete from first related answer element in xml file by GenerateAnswerTemplate() methode and attach
            created object to it(whit $.data())
    2-4 - GenerateAnswerTemplate() create table and call AddJQueryRule() for add jquey validator rule if in edit mode.then create title for more than
            one part answer.add add and remove button for multi answer and create editor for each part by call GenerateEditor() methode
    2-5 - int GenerateEditor() mehode by type property of each part,generate related control and set property for it:
            -if is remote control, start get xml data from remote url by $.get() and then fill it by fillControlFromRemote()methode
            -if is popup control, set url for popup
            -if is img contol, set change event handler for 'input:file' child of it 
*/

var formGenerator = {
    //get xml schema and init container element
    init: function (container, sourceUrl, destinationUrl, xmlContainer, logContainer, inEditMode, useAjax, options) {
        if (!container.hasClass('fg-container')) {
            //save setting
            inEditMode = inEditMode == 'edit' ? true : (inEditMode == 'view' ? false : inEditMode);
            if (options == undefined) {
                options = new Object();
            }
            container.addClass('fg-container')
                .data('fg-xml-container', xmlContainer)
                .data('fg-log-container', logContainer)
                .data('fg-mode', (inEditMode == undefined ? true : inEditMode))
                .data('fg-url-des', destinationUrl)
                .data('fg-use-ajax', useAjax == undefined ? false : useAjax)
                .data('fg-options', options);
            //get xml from url
            $.get(sourceUrl, function (xml) { formGenerator.createUIFromXml(xml, container); });
        }
    },
    //-------------------------------------------------------------------------------------------
    //create ui and fill container from xml
    createUIFromXml: function (xml, container) {
        //create jquery from xml properties element
        var jqXml = formGenerator.getXmlElementChild(xml, formGenerator.Consts.Xml.Properties.Collection);

        //create table for ui
        var rootTable = $('<table>').addClass('fg-' + formGenerator.Consts.Xml.Properties.Collection);
        //add css class if exist
        var containerCls = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.Class);
        if (containerCls != undefined) {
            rootTable.addClass(containerCls);
        }
        //save lid & help url for next use
        container.data('fg-lid', formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.LID))
            .data('fg-url-help', formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.HelpUrl))
            .data('fg-used-for-id', formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.UsedForId))
            .data('fg-min-id', formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.MinId))
            .data('fg-mid', formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.MId));
        //get error message if set in xml file and get only one time
        var urlError = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.ErrorUrl);
        var errorMessageLoaded = $('body').data('fg-errorMessageLoaded');
        if (errorMessageLoaded == undefined) {
            errorMessageLoaded = false;
        }
        if (urlError != undefined && urlError != '' && !errorMessageLoaded) {
            $('body').data('fg-errorMessageLoaded', true);
            urlError = formGenerator.addParameterToUrl(urlError, 'lid', formGenerator.getLid(container));
            $.ajax({
                url: urlError,
                success: function (data) {
                    eval(data)
                    console.log(errorMessage);
                    $.extend(jQuery.validator.messages, errorMessage);
                }
            });
        }
        var multi = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.Multi) == 'true';

        // script = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.Script);
        var model = formGenerator.generateModel(jqXml)
        container.data('fg-model', model);
        console.log(model);
        //get jquery object from xml first property collection
        var itemXml = formGenerator.getXmlElementChild(jqXml.eq(0), formGenerator.Consts.Xml.Properties.Item);

        //for each property element create ui
        itemXml.each(function () {
            var ctl = formGenerator.generateProperty(container, $(this));
            rootTable.append(ctl);
        })
        //if user can add or edit row add remove row btn
        if (!formGenerator.inViewMode(container)) {// && (model.length > 1 || multi)) {
            var tr = $('<td>').hide().addClass('fg-answers-container-template fg-btn-panel-remove')
            if (multi) {
                tr.append($('<a>').addClass('fg-remove fg-remove-row').click(function () { formGenerator.onRemoveRowClick($(this)); }));
            }
            rootTable.append($('<tr>').addClass('fg-btn-panel-remove').append($('<td>').addClass('fg-property-title'))
                .append(tr));
        }

        var uiType = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.UIType);
        container.attr('data-ui-type', uiType);
        if (uiType == 'grid') {
            var titleRow = $('<tr>');
            var valueRow = $('<tr>');
            rootTable.append(titleRow);
            rootTable.append(valueRow)
            rootTable.select('tr.fg-property').each(function (index, row) {
                $(row).find('td.fg-property-title').detach().appendTo(titleRow);
                $(row).find('td.fg-answers-container-template').detach().appendTo(valueRow);

            });
            rootTable.find('tr.fg-property').remove();
        }
        //if mode is edit add form element
        if (!formGenerator.inViewMode(container)) {
            formId = formGenerator.getNewCtlId();
            //create form and table to it
            var form = $('<form class="fg-form">').data('fg-initialized', false).attr('id', formId).append(rootTable);
            container.append(form);
            //add jquery class rules if exist
            var rules = container.data('fg-jquery-rules');

            if (rules != null && rules.length != 0) {
                rules = 'jQuery.validator.addClassRules({' + rules + '});';
                //console.info('jquery rules:', rules);
                eval(rules);
            } else {
                console.info('No jquery rules');
            }
            //create and add dialog for next use
            var dlgId = formGenerator.getNewCtlId();
            $(container).data('fg-dialog-id', '#' + dlgId);
            var dialogCtl = $('<div class="fg-popup-dialog"></div>').attr('id', dlgId);

            //create and add btn for submit
            var btnCtl = null;
            //if SubmitBtnText set then create btn
            var btnData = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.SubmitBtnText);
            if (btnData != undefined) {
                btnCtl = $('<input type="button" />').val(btnData);
            } else {
                //if SubmitImageUrl set then create img
                btnData = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.SubmitImageUrl);
                if (btnData != undefined) {
                    btnCtl = $('<img/>').attr('src', btnData);
                } else {
                    //if SubmitLinkText set then create img
                    btnData = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.SubmitLinkText);
                    if (btnData != undefined) {
                        btnCtl = $('<a/>').attr('href', 'javascript:void(0)').text(btnData);
                    } else {
                        //default behavior
                        btnCtl = $('<input type="button" />').val('Submit');
                    }
                }
            }
            //add css class if exist
            var submitClass = formGenerator.getXmlElementAttribute(jqXml, formGenerator.Consts.Xml.SubmitClass);
            if (submitClass != undefined) {
                btnCtl.addClass(submitClass);
            }
            btnCtl.addClass('fg-submit-btn');
            //add btn to content
            var trBtn = $('<td colspan="2">').append(btnCtl.data('related-form', formId).click(formGenerator.onSubmitClick)).append(dialogCtl);
            rootTable.append($('<tr>').append(trBtn));

            //if user can add new row add related btn
            if (multi) {
                trBtn.append($('<a>').addClass('fg-add fg-add-new-record').click(function () { formGenerator.createNewRecord(container, null); }));
            }
            if (formGenerator.getOptions(container).showSubmit == false) {
                btnCtl.hide();
            }
            //set jquery ui dialog for it
            dialogCtl.dialog({ autoOpen: false, modal: true });
        } else {
            //if no in edit mode only add table to container
            container.append(rootTable);
        }
        $(".loading").hide()

        formGenerator.SetControlValues(container);
        //set jquery ui tooltip setting
        rootTable.tooltip({ items: '.fg-help-btn', content: function () { return formGenerator.onShowToolTip(container, $(this)) }, track: true, tooltipClass: "fg-tooltip" });

    },
    //-------------------------------------------------------------------------------------------
    //handler for remove row btn click
    onRemoveRowClick: function (ctl) {
        var td = ctl.closest('td');
        var isNewRecord = td.attr('data-fg-new-record') == 'true';
        var container = formGenerator.getContainer(ctl);
        var uiType = container.attr('data-ui-type');
        if (uiType == 'grid') {
            if (isNewRecord) {
                ctl.closest('tr').fadeOut('slow', function () { $(this).remove(); });
            } else {
                ctl.closest('tr').find('td').addClass('fg-deleted').fadeOut('slow');
            }
        } else if (uiType == 'form') {
            var usedForId = td.attr('data-used-for-id');
            if (isNewRecord) {
                $('[data-used-for-id=' + usedForId + ']').fadeOut('slow', function () { $(this).remove(); });
            } else {
                $('[data-used-for-id=' + usedForId + ']').addClass('fg-deleted').fadeOut('slow');
            }
        }
    },
    //-------------------------------------------------------------------------------------------
    //generate model for ui
    generateModel: function (xmlItems) {
        var model = new Array();
        //model.Items = new Array();
        $(xmlItems).each(function () {
            var item = new Object();
            model.push(item);
            item.usedForId = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.UsedForId);
            //var xmlItemPropertyList = ;
            item.propertes = new Array()
            $(formGenerator.getXmlElementChild($(this), formGenerator.Consts.Xml.Properties.Item)).each(function () {
                /////
                //create property for store xml data of each property
                var property = new Object();
                //item.propertes.push(property);
                property.PrpId = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Id);
                property.Multi = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Multi) == 'true';
                property.Answers = new Array();
                var addedToItemCollection = false;
                //add answer object for each answer in current property
                formGenerator.getXmlElementChild($(this), formGenerator.Consts.Xml.Properties.Answer.Item).each(function () {
                    //check for template only answer in new mode!
                    var valueId = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Id);
                    //if (valueId == 0) {
                    // valueId = undefined;
                    //    //item.propertes.push(property);
                    //    //return;
                    //}
                    if (valueId == undefined) {
                        item.propertes.push(null);
                        return;
                    } else {
                        //if not for template(in new mode),add propertes to item collection.
                        if (!addedToItemCollection) {
                            item.propertes.push(property);
                            addedToItemCollection = true;
                        }

                        var answer = new Object();
                        answer.ValueId = valueId;//formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Id);
                        answer.Parts = new Array();
                        //add part object for each part of current answer of current property
                        $(formGenerator.getXmlElementChild($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Item)).each(function () {
                            var part = new Object();
                            part.Order = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Order);
                            //if not new template
                            if (valueId != '0') {
                                //get value from xml file
                                part.Value = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Value);
                                part.Text = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Text);
                                //use [cdate]
                                if (part.Value == undefined) {
                                    part.Value = $(this).text();
                                }
                                if (part.Value == '') {
                                    part.Value = null;
                                }
                            } else {
                                //set value to null
                                part.Value = null;
                                part.Text = null;
                            }
                            part.Url = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Url);
                            part.ThumbnailUrl = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.ThumbnailUrl);

                            answer.Parts.push(part);
                        });
                        property.Answers.push(answer);

                    }
                });
                /////
                //var property = new Object();
                //item.propertes.push(property);
                //property.Answers = new Array();
                //property.Prpid = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Id);
                ////var xmlAnswers = ;
                //$(formGenerator.getXmlElementChild($(this), formGenerator.Consts.Xml.Properties.Answer.Item)).each(function () {
                //    var answer = new Object();
                //    property.Answers.push(answer);
                //    answer.Parts = new Array();
                //    answer.ValueId = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Id);
                //    //var xmlParts = ;
                //    $(formGenerator.getXmlElementChild($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Item)).each(function () {
                //        var part = new Object();
                //        part.Order = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Order);
                //        part.Value = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Value);
                //        part.Text = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Text);
                //        //use [cdate]
                //        if (part.Value == undefined) {
                //            part.Value = $(this).text();
                //        }
                //        answer.Parts.push(part);
                //    });
                //});
            });
        });
        return model;
    },
    //-------------------------------------------------------------------------------------------
    //generate ui for each property
    //add one row for each property to main table
    generateProperty: function (rootContainer, xmlQuestion) {
        //create one row
        var qCtl = $('<tr>');
        //read property data from xml element
        var qId = formGenerator.getNewCtlId();
        var qPrpId = formGenerator.getXmlElementAttribute(xmlQuestion, formGenerator.Consts.Xml.Properties.Id);
        var qTitel = formGenerator.getXmlElementAttribute(xmlQuestion, formGenerator.Consts.Xml.Properties.Question);
        var multi = formGenerator.getXmlElementAttribute(xmlQuestion, formGenerator.Consts.Xml.Properties.Multi) == 'true';
        //read and add css class if exist
        var qCls = formGenerator.getXmlElementAttribute(xmlQuestion, formGenerator.Consts.Xml.Class);
        if (qCls) {
            qCtl.addClass(qCls);
        }
        //read answer collection from property element
        var answerList = formGenerator.getXmlElementChild(xmlQuestion, formGenerator.Consts.Xml.Properties.Answer.Item);
        if (answerList.length != 0) {
            //generate ui for interaction part(right col)
            var ctlAnswer = formGenerator.GenerateAnswers(rootContainer, answerList, qPrpId, multi)
            //create title part(left col)
            var tdTitle = $('<td>').attr('data-prp-id', qPrpId).addClass('fg-property-title').append($('<span>').text(qTitel));
            //if help url is set add help link
            if (rootContainer.data('fg-url-help') != "") {
                tdTitle.prepend($('<a>').addClass('fg-help-btn').attr('data-prp-id', qPrpId));
            }
            //add two colimn to created row
            qCtl.addClass('fg-property')
                .data('fg-prp-id', qPrpId)//todo:must remove
                .append(tdTitle)
                .append($('<td>').addClass('fg-answers-container-template').append(ctlAnswer).hide());
        }
        return qCtl;
    },
    //-------------------------------------------------------------------------------------------
    //this methode read data for each property from xml file and store in property object
    //then create ui template for each propety and attach this object to it for next use
    GenerateAnswers: function (rootContainer, xmlAnswerCollection, qPrpId, multi) {
        ////create property for store xml data of each property
        //var property = new Object();
        //property.PrpId = qPrpId
        //property.Multi = multi;
        //property.Answers = new Array();
        ////add answer object for each answer in current property
        //xmlAnswerCollection.each(function () {
        //    var answer = new Object();
        //    answer.ValueId = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Id);
        //    answer.Parts = new Array();
        //    var xmlPartJQuery = formGenerator.getXmlElementChild($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Item);
        //    //add part object for each part of current answer of current property
        //    $(xmlPartJQuery).each(function () {
        //        var part = new Object();
        //        part.Order = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Order);
        //        part.Value = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Value);
        //        part.Text = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Text);
        //        part.Url = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Url);
        //        part.ThumbnailUrl = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.ThumbnailUrl);
        //        //use [cdate]
        //        if (part.Value == undefined) {
        //            part.Value = $(this).text();
        //        }
        //        answer.Parts.push(part);
        //    });
        //    property.Answers.push(answer);
        //});
        //for create template,use first answer parts
        var firstAnswerPart = xmlAnswerCollection.first().find(formGenerator.Consts.Xml.Properties.Answer.Part.Item);
        //create template from answer parts
        var ctlContainer = formGenerator.GenerateAnswerTemplate(rootContainer, firstAnswerPart, qPrpId, multi);
        ////attach object to created template
        //ctlContainer.data('fg-values', property);
        return ctlContainer;
    },
    //-------------------------------------------------------------------------------------------
    //generate template from parts list
    GenerateAnswerTemplate: function (rootContainer, xmlPartsJQuery, qPrpId, multi) {
        var id = formGenerator.getNewCtlId();
        var inViewMode = formGenerator.inViewMode(rootContainer);
        //create main container
        var ctlContainer = $('<table>').attr({ 'id': id, 'fg-prp-id': qPrpId }).addClass('fg-answers');
        //if mode is edit generate jquery validation rule
        if (!inViewMode) {
            formGenerator.AddJQueryRule(rootContainer, xmlPartsJQuery, qPrpId);
        }
        //get Orientation for generate template
        var orientation = formGenerator.getXmlElementAttribute(xmlPartsJQuery.eq(0), formGenerator.Consts.Xml.Properties.Answer.Part.Orientation)
        if (orientation == undefined) {
            orientation = 'horizontal'
        }

        //if part count is more than one,must add title row
        var captionCount = xmlPartsJQuery.length;
        if (captionCount > 1) {
            var trTitle = $('<tr>').addClass('fg-caption');
            if (orientation == 'horizontal') {

                for (var index = 0; index < captionCount; index++) {
                    trTitle.append($('<td>').text(formGenerator.getXmlElementAttribute(xmlPartsJQuery.eq(index), formGenerator.Consts.Xml.Properties.Answer.Part.Caption)));
                }
            } else if (orientation == 'vertical') {
                trTitle.append($('<td>'));
            }
            //if mode is edit and can add more that one answer,add botton for add and remove row
            if (multi && !inViewMode) {
                trTitle.append($('<td>').addClass('fg-answer-btn-header'));
            }
            ctlContainer.append(trTitle);

        } else if (multi && !inViewMode) {
            var trTitle = $('<tr>').addClass('fg-caption');
            trTitle.append($('<td>'));
            if (orientation == 'vertical') {
                trTitle.append($('<td>'));
            }
            trTitle.append($('<td>').addClass('fg-answer-btn-header'));
            ctlContainer.append(trTitle);
        }
        var trAnswer = $('<tr>');
        //if can not add more than one answer,then no tempate need.convert it to one part of ui
        if (multi) {
            trAnswer.addClass('fg-answer-template');
        } else {
            trAnswer.addClass('fg-answer').addClass('fg-answer-ctl');
        }
        //then for each part,add editor to row
        if (orientation == 'horizontal') {
            xmlPartsJQuery.each(function () {
                var order = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Order);
                var ctlPart = formGenerator.GenerateEditor(rootContainer, this, qPrpId)
                ctlPart.attr('data-fg-order', order);
                trAnswer.append($('<td>').append(ctlPart));
            });
        } else if (orientation == 'vertical') {

            var tmpTable = $('<table>').css('width', '100%');
            trAnswer.append($('<td>').append(tmpTable));
            xmlPartsJQuery.each(function () {
                var order = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Order);
                var ctlPart = formGenerator.GenerateEditor(rootContainer, this, qPrpId)
                ctlPart.attr('data-fg-order', order);
                tmpTable.append($('<tr>').append($('<td>').addClass('fg-caption').text(formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Caption))).append($('<td>').append(ctlPart)));
            });
        }
        //xmlPartsJQuery.each(function () {
        //    var order = formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Order);
        //    var ctlPart = formGenerator.GenerateEditor(rootContainer, this, qPrpId)
        //    ctlPart.attr('data-fg-order', order);
        //    if (orientation == 'horizontal') {
        //        trAnswer.append($('<td>').append(ctlPart));
        //    } else if (orientation == 'vertical') {
        //        trAnswer.append($('<td>').addClass('fg-caption').text(formGenerator.getXmlElementAttribute($(this), formGenerator.Consts.Xml.Properties.Answer.Part.Caption)))
        //        .append($('<td>').append(ctlPart));

        //    }
        //});
        if (multi && !inViewMode) {
            trAnswer.append($('<td>').addClass('fg-add').click(formGenerator.onBtnAddRemoveAnswerClick));
        }
        ctlContainer.append(trAnswer);
        return ctlContainer;
    },
    //-------------------------------------------------------------------------------------------
    //generate editor for each part
    GenerateEditor: function (rootContainer, xmlPart, qPrpId) {
        var inViewMode = formGenerator.inViewMode(rootContainer);// rootContainer.data('fg-mode');
        var ctlId = formGenerator.getNewCtlId();
        var xmlPartjQuery = $(xmlPart);
        var type = formGenerator.getXmlElementAttribute(xmlPartjQuery, formGenerator.Consts.Xml.Properties.Answer.Part.Type);
        var ctlType = formGenerator.Consts.UI.Templates[type];

        var ctl = $(ctlType);
        if (ctlType == undefined || ctl == undefined) {
            ctl = $(formGenerator.Consts.UI.Templates.error);
        }
        var ctlClass = formGenerator.getXmlElementAttribute(xmlPartjQuery, formGenerator.Consts.Xml.Properties.Answer.Part.Class);
        if (ctlClass != undefined) {
            ctl.addClass(ctlClass);
        }
        if (inViewMode) {



            ctl.attr('disabled', 'disabled');
        }
        var order = formGenerator.getXmlElementAttribute(xmlPartjQuery, formGenerator.Consts.Xml.Properties.Answer.Part.Order);
        var value = formGenerator.getXmlElementAttribute(xmlPartjQuery, formGenerator.Consts.Xml.Properties.Answer.Part.Value);
        if (value == undefined) {
            ctl.attr('data-fg-cdata', 'true');
        }

        if (ctl.hasClass('fg-captcha-ctl')) {
            ctl.find('img').attr('src', xmlPartjQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Url));
            ctl.find('input').addClass(formGenerator.generateValidationRuleName(qPrpId, order)).attr({ 'id': ctlId, 'name': ctlId, 'data-fg-order': order });
        } else {
            ctl.addClass(formGenerator.generateValidationRuleName(qPrpId, order)).attr({ 'id': ctlId, 'name': ctlId, 'data-fg-order': order });
        }
        if (ctl.hasClass('fg-remote-ctl')) {
            var url = xmlPartjQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Url);
            ctl.addClass('fg-ctl-loading')
            $.get(url, function (xml) { formGenerator.fillControlFromRemote(xml, ctl) });
        } else if (ctl.hasClass('fg-popup-ctl')) {
            ctl.click(function (e) {
                e.preventDefault();
                formGenerator.onOpenPopup($(this));
            })
                .attr({
                    'data-fg-url': xmlPartjQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Url),
                    'data-fg-related-prpid': xmlPartjQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.RelatedPrpId)
                });
        } else if (ctl.hasClass('fg-img-ctl') || ctl.hasClass('fg-file-ctl')) {
            var fileSize = formGenerator.getXmlElementAttribute(xmlPartjQuery, formGenerator.Consts.Xml.Properties.Answer.Part.V_FileSize);
            var fileType = formGenerator.getXmlElementAttribute(xmlPartjQuery, formGenerator.Consts.Xml.Properties.Answer.Part.V_FileType);
            ctl.find('input:file').change(formGenerator.onFileLoad);
            if (fileSize != undefined) {
                ctl.find('input:file').attr('data-fg-file-size', fileSize);
            }
            if (fileType != undefined) {
                ctl.find('input:file').attr('data-fg-file-type', fileType);
            }
        } else if (ctl.hasClass('fg-list-ctl')) {
            ctl.data('fg-url', xmlPartjQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Url));
            if (!inViewMode) {
                var addBtn = $('<a>').attr('href', 'javascript:void(0)').addClass('fg-add').click(function () {
                    formGenerator.onOpenSelectorPopup($(this).closest('ul'));
                });
                ctl.append($('<li>').addClass('fg-btn-panel').append(addBtn));
            }
        }
        return ctl;
    },
    //-------------------------------------------------------------------------------------------
    //add ui row for model or new record
    createNewRecord: function (rootContainer, modelItem) {
        //create new row for grid 
        if (rootContainer.attr('data-ui-type') == 'grid') {
            var newRow = $('<tr>');
            if (formGenerator.inViewMode(rootContainer)) {
                newRow.appendTo(rootContainer.find('table.fg-properties'));
            } else {
                newRow.insertBefore('table.fg-properties tr:last');
            }
        }
        //generate new id for ui new record(not from db)
        if (modelItem == null) {
            var prpId = formGenerator.getNewCtlId();
        } else {
            var prpId = modelItem.usedForId;
        }
        rootContainer.find('.fg-answers-container-template').each(function (index, template) {
            //create copy from it and 
            var ctl = $(template).clone(true);
            ctl.removeClass('fg-answers-container-template')
                .addClass('fg-answers-container');
            //add to ui
            if (newRow == undefined) {
                ctl.appendTo($(template).parent());
            } else {
                ctl.appendTo(newRow);
            }
            ctl.fadeIn('slow');
            var answerTable = ctl.find('.fg-answers');
            ctl.attr('data-used-for-id', prpId);
            if (modelItem == null) {
                //if is UI record, only init ui  
                formGenerator.addAnswerToUICollection(answerTable)
                ctl.attr('data-fg-new-record', 'true');
            } else {
                ctl.attr('data-fg-new-record', 'false');
                //if not remove btn template set ui from model
                if (!ctl.hasClass('fg-btn-panel-remove')) {
                    //find related data from model
                    var property = modelItem.propertes[index];
                    //if not new template(with no prpId)
                    if (property != null) {
                        //console.log(index, property);
                        $(property.Answers).each(function () {

                            if (property.Multi) {
                                var answerCtl = formGenerator.addAnswerToUICollection(answerTable);
                            } else {
                                var answerCtl = answerTable.find('.fg-answer');
                            }
                            if (this.ValueId != 0) {
                                formGenerator.fillAnswerValue(answerCtl, this);
                            }
                        });
                    }
                    if (answerTable.find('ul.fg-list-ctl').length != 0) {

                        //for list control
                        answerTable.find('tr.fg-answer-ctl').removeClass('fg-answer-ctl');
                    }
                    answerTable.find('.fg-add').not(':last').not(':first').removeClass('fg-add').addClass('fg-remove');
                }
            }
        });
    },
    //-------------------------------------------------------------------------------------------
    //set content of control from data resive from server in xml file that store in property object
    SetControlValues: function (rootContainer) {
        var remoteCtl = rootContainer.find('.fg-remote-ctl');
        //is all ajax control loaded
        if (remoteCtl.length == 0 && !rootContainer.data('fg-initialized')) {
            //set 'fg-initialized' for run only once this methode
            rootContainer.data('fg-initialized', true);
            var model = rootContainer.data('fg-model');
            var uiType = rootContainer.attr('data-ui-type')

            $(model).each(function () {
                formGenerator.createNewRecord(rootContainer, this);
            });
        }
    },
    //-------------------------------------------------------------------------------------------
    //fill ctl from answer
    fillAnswerValue: function (ctl, answer) {
        var inViewMode = formGenerator.inViewMode(ctl);
        $(answer.Parts).each(function () {
            var editor = ctl.find('[data-fg-order=' + this.Order + ']').first();
            if (editor.hasClass('fg-check-list')) {
                editor.find('[value=' + this.Value + ']').prop('checked', true).data('fg-org-val', this.Value).parent().data('fg-value-id', answer.ValueId);
            } else {
                ctl.data('fg-value-id', answer.ValueId)
                if (editor.hasClass('fg-popup-ctl')) {
                    editor.data('fg-val', this.Value).data('fg-org-val', this.Value).find('label').text(this.Text);
                    if (inViewMode) {
                        editor.find('span.fg-image').remove();
                    }
                } else if (editor.hasClass('fg-img-ctl')) {
                    editor.find('input:file').remove();
                    editor.append($('<img>').click(formGenerator.onImageClick).attr('src', this.ThumbnailUrl).attr('data-fg-img', this.Url));
                } else if (editor.hasClass('fg-file-ctl')) {
                    editor.find('input:file').remove();
                    editor.append($('<a>').attr({ 'href': this.Url, 'target': '_blank' }).append($('<img>').attr('data-fg-url', this.Url).addClass('fg-file-' + this.Url.split('.').pop())));
                }
                else if (editor.hasClass('fg-radio-list')) {
                    editor.data('fg-org-val', this.Value).find('[value=' + this.Value + ']').prop('checked', true);
                } else if (editor.hasClass('fg-list-ctl')) {
                    //for list control
                    //this do in template mode(no prpId)
                    //editor.parent().parent().removeClass('fg-answer-ctl');
                    formGenerator.addItemToList(editor,
                        {
                            Text: this.Text,
                            Value: this.Value,
                            ValueId: answer.ValueId
                        });
                } else {
                    editor.val(this.Value).data('fg-org-val', this.Value)
                }
            }

        });
    },
    //-------------------------------------------------------------------------------------------
    //event handler for add or remove answer button
    onBtnAddRemoveAnswerClick: function () {
        if ($(this).hasClass('fg-add')) {
            $(this).removeClass('fg-add').addClass('fg-remove');
            var container = $(this).parent().parent();
            formGenerator.addAnswerToUICollection(container);
        } else {
            var tr = $(this).parent();
            //if answer come from server and has value id,then only hide it,else remove it
            if (tr.data('fg-value-id') == undefined) {
                tr.remove();
            } else {
                tr.find('input,select').val('').end().find(':checked').prop('checked', false).end().find('.fg-img-ctl img').removeAttr('src').end().find('.fg-file-ctl img').attr('data-fg-url', '').end().find('button').removeData('fg-val').end().hide();
            }
        }

    },
    //-------------------------------------------------------------------------------------------
    //create copy item from template and add to answer collection 
    addAnswerToUICollection: function (container) {
        var newId = formGenerator.getNewCtlId();
        var copy = container.find('.fg-answer-template').clone().removeClass('fg-answer-template').addClass('fg-answer fg-answer-ctl').find('.fg-add').click(formGenerator.onBtnAddRemoveAnswerClick).end().find('.fg-popup-ctl').click(function (e) { e.preventDefault(); formGenerator.onOpenPopup($(this)); }).end().find('input:file').change(formGenerator.onFileLoad).end().find('.fg-part-ctl').attr({ 'id': newId, 'name': newId }).end();
        container.append(copy);
        return copy;
    },
    //-------------------------------------------------------------------------------------------
    //fill control from xml that get by $.get methode
    fillControlFromRemote: function (xml, ctl) {
        ctl.removeClass('fg-ctl-loading');
        xml = $(xml).find(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Collection)
        var itemGenerator;
        var ctlName = ctl.attr('name');
        if (ctl.hasClass('fg-select')) {
            itemGenerator = function (xmlElementJQuery) {
                return $('<option>').attr('value', xmlElementJQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.ValueMember)).text(xmlElementJQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.DisplayMember))
            }
        } else if (ctl.hasClass('fg-radio-list')) {
            itemGenerator = function (xmlElementJQuery) {
                return $('<div>').append($('<input type="radio">').attr({ 'value': xmlElementJQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.ValueMember), 'name': ctlName })).append(xmlElementJQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.DisplayMember));
            }
        } else if (ctl.hasClass('fg-check-list')) {
            ctl.parent().parent().removeClass('fg-answer-ctl');
            var order = ctl.attr('data-fg-order');
            itemGenerator = function (xmlElementJQuery) {
                return $('<div>').addClass('fg-answer-ctl').append($('<input type="checkbox" >').addClass('fg-part-ctl').attr({ 'data-fg-order': order, 'value': xmlElementJQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.ValueMember), 'name': ctlName })).append(xmlElementJQuery.attr(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.DisplayMember));
            }
        }
        xml.find(formGenerator.Consts.Xml.Properties.Answer.Part.RemoteData.Item).each(function () {
            ctl.append(itemGenerator($(this)));
        })
        ctl.removeClass('fg-remote-ctl');
        if (formGenerator.inViewMode(ctl)) {
            ctl.find('input').attr('disabled', 'disabled');
        }
        formGenerator.SetControlValues(formGenerator.getContainer(ctl));
    },
    //-------------------------------------------------------------------------------------------
    //add jquery rule to ui
    AddJQueryRule: function (rootContainer, xmlPartJQuery, qPrpId) {
        //foreach attribute that start by v_ in current part xml,add validation rule to cillection
        xmlPartJQuery.each(function () {
            var rule = '';
            var order = $(this).attr(formGenerator.Consts.Xml.Properties.Answer.Part.Order);
            $.each(this.attributes, function () {
                if (this.name.indexOf('v_') == 0 && this.value != "") {
                    var rulePart = formGenerator.getXmlElementAttributeJQueryRule(this);
                    if (rule.length != 0) {
                        rule += ',';
                    }
                    rule += rulePart;
                }

            });
            if (rule.length != 0) {
                var rules = rootContainer.data('fg-jquery-rules');
                if (rules == undefined) {
                    rules = '';
                }
                if (rules.length != 0) {
                    rules += ',';
                }
                rules += '"' + formGenerator.generateValidationRuleName(qPrpId, order) + '" : {' + rule + '}';
                rootContainer.data('fg-jquery-rules', rules);
            }
        })
    },
    //-------------------------------------------------------------------------------------------
    //generate rule uniq name for each propId
    generateValidationRuleName: function (qPrpId, order) {
        return 'fg_validator_qPrpId' + qPrpId + '_order' + order;
    },
    //-------------------------------------------------------------------------------------------
    //event handler for display tooltip,if data not exist get it by $.get() first time
    onShowToolTip: function (rootContainer, ctl) {
        var content = ctl.attr("Title");
        if (content == undefined) {
            content = '<div class="fg-help-load"></div>';
            formGenerator.getLid(ctl);
            var prpId = ctl.attr('data-prp-id');
            ctl.addClass('fg-hover').mouseleave(function () { $(this).removeClass('fg-hover') });
            $.get(rootContainer.data('fg-url-help'), { 'prpId': prpId, 'lid': formGenerator.getLid(ctl) }, function (data) {
                ctl.attr('title', data).tooltip({ tooltipClass: "fg-tooltip" }).tooltip("close").filter(".fg-hover").tooltip("open");
            });
        }
        return content;
    },
    //-------------------------------------------------------------------------------------------
    //event handler for submit button
    onSubmitClick: function (e) {
        var mainContainer = formGenerator.getContainer(this);
        var form = mainContainer.find('form').eq(0);
        //var form = $('#' + $(this).data('related-form'));
        //var mainContainer = form.parent();
        var xml_container = mainContainer.data('fg-xml-container')
        var destinationUrl = mainContainer.data('fg-url-des');
        var useAjax = mainContainer.data('fg-use-ajax');
        var validateOptions = formGenerator.getOptions(mainContainer).validateOptions;
        if (validateOptions == null) {
            validateOptions = {};
        }
        if (validateOptions.errorClass == undefined) {
            validateOptions.errorClass = "fg-error"
        } else {
            validateOptions.errorClass += " fg-error"
        }
        var errorPlacementFunction = null;
        //if(errorPlacement
        form.validate(validateOptions);
        if (form.valid()) {
            var xml = formGenerator.GenerateXml(mainContainer);
            if (xml != null) {
                if (xml_container != null && xml_container != undefined) {
                    $(xml_container).text(xml);
                }
                if (destinationUrl != null && destinationUrl != undefined && destinationUrl != '') {
                    if (useAjax) {
                        $.post(destinationUrl,
                            { "xmlData": xml },
                            function (data) {
                                eval(data);
                            });
                        //$.ajax({
                        //    url: destinationUrl
                        //    , type: "POST"
                        //    , contentType: "text/xml"
                        //    , processData: false
                        //    , data:  xml 
                        //    , success:
                        //function (data) {
                        //    eval(data);
                        //}
                        //});
                    } else {
                        var o = $('<form>').attr({ 'method': 'post', 'action': destinationUrl }).append($('<input type="hidden" name="xmlData" >').val(xml));
                        mainContainer.append(o);
                        o.submit();
                    }

                }
            } else {
                if (xml_container != null && xml_container != undefined) {
                    $(xml_container).text('No Change Detect.');
                }
            }
        }
    },
    //-------------------------------------------------------------------------------------------
    //generate xml from ui
    GenerateXml: function (mainContainer) {
        var uiStatus_container = mainContainer.data('fg-log-container')
        if (uiStatus_container != null && uiStatus_container != undefined) {
            var item_container = $('<ul>')
            $(uiStatus_container).html('').append(item_container);
            var addlog = true;
        }

        var xmlDoc = null;
        var lid = formGenerator.getLid(mainContainer);
        var minId = formGenerator.getContainer(mainContainer).data('fg-min-id');
        //first find all remove btn panel
        mainContainer.find('td.fg-answers-container.fg-btn-panel-remove').each(function () {
            var isNewRecord = $(this).attr('data-fg-new-record') == 'true';

            var deleted = $(this).hasClass('fg-deleted');
            var groupId = $(this).attr('data-used-for-id');
            if (isNewRecord) {
                var usedForId = '0';
            } else {
                var usedForId = $(this).attr('data-used-for-id');
            }
            var action = '';
            if (deleted) {
                action = 'delete';
            } else if (isNewRecord) {
                action = 'new';
            } else {
                action = 'edit'
            }
            //find related control
            var relatedCtrl = mainContainer.find('[data-used-for-id=' + groupId + '] .fg-answers');
            var xmlroot = null;
            if (addlog) {
                if (deleted) {
                    item_container.append($('<li>').css('color', 'red').append("(Deleted) usedForId : " + usedForId));
                } else {
                    var status_container = $('<ul>');
                    item_container.append($('<li>').append("usedForId : " + usedForId).append(status_container));
                }



            }
            //if row deleted add data to xml file and go to next record
            if (deleted) {
                if (xmlroot == null) {
                    if (xmlDoc == null) {
                        xmlDoc = formGenerator.createXmlDoc();
                    }
                    xmlroot = formGenerator.addXmlPropertiesElement(xmlDoc, lid, usedForId, minId, action);
                }
                return;
            }
            relatedCtrl.each(function () {
                var prpId = $(this).attr('fg-prp-Id');
                if (addlog) {
                    var ulAnswer = $('<ul>');
                    status_container.append($('<li>').append("Prp Id : " + prpId).append(ulAnswer));
                }
                var propertyElement = null;
                var answersElement = null;
                $(this).find('.fg-answer-ctl').each(function () {
                    var answerElement = null;
                    var valueId = $(this).data('fg-value-id');
                    valueId = valueId == undefined ? '0' : valueId;
                    if (addlog) {
                        var ulPart = $('<ul>');
                        ulAnswer.append($('<li>').append('Value Id : ' + valueId).append(ulPart));
                    }
                    $(this).find('.fg-part-ctl').each(function () {
                        var ctlValues = formGenerator.GetCtlElementValue($(this));
                        if (addlog) {
                            var liPart = $('<li>').append('Order : ' + $(this).attr('data-fg-order') + ' ,Value : ' + ctlValues.NewValue + " ,Orginal Value : " + ctlValues.OldValue);
                            if (ctlValues.Changed) {
                                liPart.css('color', 'red');
                            }
                            ulPart.append(liPart);
                        }
                        if (ctlValues.Changed) {
                            if (answerElement == null) {
                                if (answersElement == null) {
                                    if (propertyElement == null) {
                                        if (xmlroot == null) {
                                            if (xmlDoc == null) {
                                                xmlDoc = formGenerator.createXmlDoc();
                                            }
                                            xmlroot = formGenerator.addXmlPropertiesElement(xmlDoc, lid, usedForId, minId, action);
                                        }
                                        propertyElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Item);
                                        propertyElement.setAttribute(formGenerator.Consts.Xml.Properties.Id, prpId);
                                        xmlroot.appendChild(propertyElement);
                                    }
                                    answersElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Answer.Collection);
                                    propertyElement.appendChild(answersElement);
                                }
                                answerElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Answer.Item);
                                answerElement.setAttribute(formGenerator.Consts.Xml.Properties.Answer.Id, valueId);
                                answersElement.appendChild(answerElement);
                            }
                            var partElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Answer.Part.Item);
                            partElement.setAttribute(formGenerator.Consts.Xml.Properties.Answer.Part.Order, $(this).attr('data-fg-order'));
                            var value = (ctlValues.NewValue == null ? '' : ctlValues.NewValue);
                            if ($(this).attr('data-fg-cdata') != undefined) {
                                partElement.appendChild(xmlDoc.createCDATASection(value));
                            } else {
                                partElement.setAttribute(formGenerator.Consts.Xml.Properties.Answer.Part.Value, value);
                            }
                            answerElement.appendChild(partElement);
                        }
                    });
                })
            });
        });

        if (xmlDoc != null) {
            if (window.ActiveXObject) {
                xmlDoc = xmlDoc.xml;
            } else {
                xmlDoc = new XMLSerializer().serializeToString(xmlDoc);
            }
        }

        return xmlDoc;
    },
    GenerateXml_: function (mainContainer) {
        var uiStatus_container = mainContainer.data('fg-log-container')
        if (uiStatus_container != null && uiStatus_container != undefined) {
            var status_container = $('<ul>');
            $(uiStatus_container).html('').append(status_container);
            var addlog = true;
        }

        var xmlDoc = null;
        var xmlroot = null;
        mainContainer.find('.fg-answers').each(function () {

            var prpId = $(this).data('fg-prp-Id');
            if (addlog) {
                var ulAnswer = $('<ul>');
                status_container.append($('<li>').append("Prp Id : " + prpId).append(ulAnswer));
            }
            var propertyElement = null;
            var answersElement = null;
            $(this).find('.fg-answer-ctl').each(function () {
                var answerElement = null;
                var valueId = $(this).data('fg-value-id');
                valueId = valueId == undefined ? '' : valueId;
                if (addlog) {
                    var ulPart = $('<ul>');
                    ulAnswer.append($('<li>').append('Value Id : ' + valueId).append(ulPart));
                }
                $(this).find('.fg-part-ctl').each(function () {
                    var ctlValues = formGenerator.GetCtlElementValue($(this));
                    if (addlog) {
                        var liPart = $('<li>').append('Order : ' + $(this).attr('data-fg-order') + ' ,Value : ' + ctlValues.NewValue + " ,Orginal Value : " + ctlValues.OldValue);
                        if (ctlValues.Changed) {
                            liPart.css('color', 'red');
                        }
                        ulPart.append(liPart);
                    }
                    if (ctlValues.Changed) {
                        if (answerElement == null) {
                            if (answersElement == null) {
                                if (propertyElement == null) {
                                    if (xmlroot == null) {
                                        if (window.DOMParser) {
                                            parser = new DOMParser();
                                            xmlDoc = parser.parseFromString('<root></root>', "text/xml");
                                        }
                                        else // Internet Explorer
                                        {
                                            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                                            xmlDoc.async = false;
                                            xmlDoc.loadXML('<root></root>');
                                        }
                                        xmlroot = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Collection);
                                        xmlroot.setAttribute(formGenerator.Consts.Xml.LID, mainContainer.data('fg-lid'));
                                        xmlroot.setAttribute(formGenerator.Consts.Xml.LID, mainContainer.data('fg-mid'));
                                        xmlroot.setAttribute(formGenerator.Consts.Xml.UsedForId, mainContainer.data('fg-used-for-id'));
                                        xmlDoc.getElementsByTagName("root")[0].appendChild(xmlroot)
                                    }
                                    propertyElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Item);
                                    propertyElement.setAttribute(formGenerator.Consts.Xml.Properties.Id, prpId);
                                    xmlroot.appendChild(propertyElement);
                                }
                                answersElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Answer.Collection);
                                propertyElement.appendChild(answersElement);
                            }
                            answerElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Answer.Item);
                            answerElement.setAttribute(formGenerator.Consts.Xml.Properties.Answer.Id, valueId);
                            answersElement.appendChild(answerElement);
                        }
                        var partElement = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Answer.Part.Item);
                        partElement.setAttribute(formGenerator.Consts.Xml.Properties.Answer.Part.Order, $(this).attr('data-fg-order'));
                        var value = (ctlValues.NewValue == null ? '' : ctlValues.NewValue);
                        if ($(this).attr('data-fg-cdata') != undefined) {
                            partElement.appendChild(xmlDoc.createCDATASection(value));
                        } else {
                            partElement.setAttribute(formGenerator.Consts.Xml.Properties.Answer.Part.Value, value);
                        }
                        answerElement.appendChild(partElement);
                    }
                });
            })
        });
        if (xmlDoc != null) {
            if (window.ActiveXObject) {
                xmlDoc = xmlDoc.xml;
            } else {
                xmlDoc = new XMLSerializer().serializeToString(xmlDoc);
            }
        }

        return xmlDoc;
    },
    //-------------------------------------------------------------------------------------------
    //create xml document
    createXmlDoc: function () {
        var xmlDoc = null;
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString('<root></root>', "text/xml");
        }
        else // Internet Explorer
        {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML('<root></root>');
        }
        return xmlDoc;
    },
    //-------------------------------------------------------------------------------------------
    //create xml document Properties element
    addXmlPropertiesElement: function (xmlDoc, lid, usedForId, minId, action) {
        var xmlroot = null;
        xmlroot = xmlDoc.createElement(formGenerator.Consts.Xml.Properties.Collection);
        xmlroot.setAttribute(formGenerator.Consts.Xml.LID, lid);
        xmlroot.setAttribute(formGenerator.Consts.Xml.UsedForId, usedForId);
        if (minId != undefined) {
            xmlroot.setAttribute(formGenerator.Consts.Xml.MinId, minId);
        }
        xmlroot.setAttribute('action', action);
        xmlDoc.getElementsByTagName("root")[0].appendChild(xmlroot)
        return xmlroot;
    },
    //-------------------------------------------------------------------------------------------
    // Retrive old And new Value from UIElement
    onFileLoad: function () {
        var domCtlFile = this;
        var ctlFile = $(this);
        var maxFileSize = ctlFile.attr('data-fg-file-size');
        if (maxFileSize != undefined) {
            if (domCtlFile.files[0].size > maxFileSize) {
                alert('حجم فایل می بایست حداکثر ' + maxFileSize + ' بایت باشد');
                ctlFile.val('');
                return;
            }
        }
        var validFileTypeList = ctlFile.attr('data-fg-file-type');
        if (validFileTypeList != undefined) {
            validFileTypeList = eval(validFileTypeList);
            var currentFileType = domCtlFile.files[0].name.split('.').pop();
            if ($.inArray(currentFileType, validFileTypeList) == -1) {
                var str = '\n';
                $(validFileTypeList).each(function () { str += (this + '\n'); })
                alert('تنها فایل هایی با پسوند(های) زیر معتبر اند:' + str);
                ctlFile.val('');
                return;
            }
        }

        var reader = new FileReader();
        //for img ctl
        var img = $('<img>');

        ctlFile.parent().append(img);

        if (ctlFile.parent().hasClass('fg-img-ctl')) {
            img.click(formGenerator.onImageClick);
            reader.onload = function (event) {
                var dataUri = event.target.result;
                img.attr('src', dataUri);
                ctlFile.remove();
            };
        } else if (ctlFile.parent().hasClass('fg-file-ctl')) {
            reader.onload = function (event) {
                var dataUri = event.target.result;
                img.attr('data-fg-content', dataUri).addClass('fg-file-' + domCtlFile.files[0].name.split('.').pop());
                img.wrap($('<a>').attr('href', dataUri));
                ctlFile.remove();
            };
        }

        reader.onerror = function (event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };

        reader.readAsDataURL(this.files[0]);
    },
    //event handler for image dbl Click
    onImageClick: function () {
        var url = $(this).attr('data-fg-img');
        if (url == undefined) {
            url = $(this).attr('src');
        }
        var dlg = $('<div style="text-align:center">')
            .append($('<img>').attr('src', url))
            .append($('<br>'))
            .append($('<a>').attr({ 'href': url, 'target': '_blank' }).text('دریافت فایل'));
        $('body').append(dlg);
        dlg.dialog(
            {
                modal: true,
                minWidth: 150,
                minHeight: 150,
                close: function () { $(this).remove(); }

            }).parent().css({ 'font-size': '10px', 'font-family': 'BKoodakBold' });

    },
    //-------------------------------------------------------------------------------------------
    //event handler for open popup
    onOpenPopup: function (ctl) {
        // ctl = ctl.closest('.fg-answer');
        var container = formGenerator.getContainer(ctl);
        var url = ctl.attr('data-fg-url');
        url = formGenerator.addParameterToUrl(url, "order", ctl.attr('data-fg-order'));
        url = formGenerator.addParameterToUrl(url, "refid", ctl.attr('id'));
        url = formGenerator.addParameterToUrl(url, "lid", formGenerator.getLid(ctl));
        url = formGenerator.addParameterToUrl(url, "mid", formGenerator.getMid(ctl));


        var value = formGenerator.GetCtlElementValue(ctl).NewValue;
        if (value != undefined) {
            url = formGenerator.addParameterToUrl(url, "value", value);
        }
        url = formGenerator.addParameterToUrl(url, "prpId", ctl.closest('.fg-answers').attr('fg-prp-id'));
        var canOpenDialog = true;
        var relatedPrpId = ctl.attr('data-fg-related-prpid');
        if (relatedPrpId != null && relatedPrpId != undefined && relatedPrpId != '') {
            $.each(relatedPrpId.split(','), function (key, prpId) {
                var relatedCtl = container.find('.fg-answers[fg-prp-id="' + prpId + '"]').find('.fg-answer').not(':hidden').first().find('.fg-part-ctl');
                //console.log(relatedCtl);
                var values = ''
                relatedCtl.each(function () {
                    var ctlValues = formGenerator.GetCtlElementValue($(this));
                    if (values != '') {
                        values += ',';
                    }
                    if (ctlValues.NewValue != null && ctlValues.NewValue != undefined || ctlValues.NewValue != '') {
                        values += ctlValues.NewValue;
                    }
                });
                //var ctlValues = formGenerator.GetCtlElementValue(relatedCtl);
                //if (ctlValues.NewValue == null || ctlValues.NewValue == undefined || ctlValues.NewValue == '') {
                if (values == '') {
                    alert("لطفا ابتدا فیلد '" + container.find('.fg-property-title[data-prp-id="' + prpId + '"]  span').text() + "' را تنظیم نمایید.");
                    canOpenDialog = false;
                } else {
                    url = formGenerator.addParameterToUrl(url, 'pId_' + prpId, values);
                }
            });
        }
        if (canOpenDialog) {
            $(formGenerator.getContainer(ctl).data('fg-dialog-id')).data('fg-source-id', ctl.attr('id')).empty().append($('<iframe class="for-dialog"/>').addClass('for-dialog').attr('src', url)).dialog("open");
        }

    },
    //-------------------------------------------------------------------------------------------
    //open selector popup for local 
    onOpenSelectorPopup: function (ctl) {
        var lid = formGenerator.getLid(ctl)
        var mid = formGenerator.getMid(ctl);
        var prpId = ctl.closest('.fg-answers').attr('fg-prp-id');

        var urlParams;
        (window.onpopstate = function () {
            var match,
                pl = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);



        })

            ();
        var dmnid = urlParams["dmnid"] || 0
        var url = formGenerator.addParameterToUrl($(ctl).data('fg-url'), 'lid', lid);
        var url = formGenerator.addParameterToUrl(url, 'mid', mid);
        var url = formGenerator.addParameterToUrl(url, 'prpid', prpId);
        var url = formGenerator.addParameterToUrl(url, 'dmnid', dmnid);
        var dlg = $('<div><div class="fg-select-dlg-server"></div><ul class="fg-select-dlg-result-list"></ul> <div>');
        var serverSide = dlg.find('.fg-select-dlg-server');
        var dlgContainer = $(formGenerator.getContainer(ctl).data('fg-dialog-id'));
        var listCtl = dlg.find('.fg-select-dlg-result-list');
        //add related class
        if (ctl.hasClass('fg-text-list-ctl')) {
            listCtl.addClass('fg-text-list-ctl');
        } else if (ctl.hasClass('fg-img-list-ctl')) {
            listCtl.addClass('fg-img-list-ctl');
        }
        dlgContainer.data('fg-source-id', ctl.attr('id')).empty().append(dlg);
        serverSide.load(url, null, function () {
            //set auto complete
            serverSide.find('[data-auto-complete-source]').each(function () {
                var url = $(this).attr('data-auto-complete-source');
                var count = $(this).attr('data-auto-complete-minLength');
                if (count == undefined) {
                    count = 3;
                }
                $(this).autocomplete({
                    source: function (request, response) {
                        request.lid = lid;
                        request.prpId = prpId;
                        request.mId = mid;
                        $.getJSON(url, request, function (data, status, xhr) { response(data); });
                    },
                    minLength: count
                })
            })
            serverSide.find('select[data-url]').each(function () {
                var ctl = $(this).addClass('fg-select fg-ctl-loading');
                $.ajax({
                    cache: false,
                    url: ctl.attr('data-url'),
                    data: { 'Lid': lid },
                    success: function (data) {
                        formGenerator.fillControlFromRemote(data, ctl)
                    }
                });
            });
            serverSide.find('form').submit(function (e) {
                e.preventDefault();
                //clear items
                listCtl.empty();
                listCtl.addClass('fg-ctl-loading');
                $.ajax({
                    type: 'get',
                    url: $(this).attr('action'),
                    data: $(this).find('.fg-select-param').serialize() + '&lid=' + lid + '&mid=' + mid + '&prpId=' + prpId + '&dmnid=' + dmnid,
                    success: function (data) {
                        listCtl.removeClass('fg-ctl-loading');

                        $(data).each(function () {
                            var newItemCtl = formGenerator.addItemToList(listCtl, this);
                            //by dblckick add item to main list
                            newItemCtl.dblclick(function () {
                                var dataItem = $(this).find('.fg-list-ctl-item').data('fg-data-item');
                                formGenerator.addItemToList(ctl, dataItem);
                                $(this).remove();
                            });
                        });
                    }
                });
            })
        });
        dlgContainer.dialog("open");
    },
    //-------------------------------------------------------------------------------------------
    //get old and new value of control
    GetCtlElementValue: function (uiElement) {
        var newVal = null;
        var oldVal = null;
        var changed = false;
        if (uiElement.hasClass('fg-radio-list')) {
            newVal = uiElement.find(':checked').val();
            oldVal = uiElement.data('fg-org-val');
            changed = (oldVal != newVal);
        }
        else if (uiElement.hasClass('fg-popup-ctl')) {

            newVal = uiElement.data('fg-val');
            oldVal = uiElement.data('fg-org-val');
            changed = (oldVal != newVal);
        } else if (uiElement.hasClass('fg-img-ctl')) {
            var img = uiElement.find('img');
            if (img.length != 0) {
                newVal = img.attr('src');
                oldVal = img.attr('data-fg-img');
                changed = (newVal == undefined || oldVal == undefined);
                if (!changed) {
                    newVal = oldVal;
                }
            } else {
                changed = false;
            }
        } else if (uiElement.hasClass('fg-file-ctl')) {
            var img = uiElement.find('img');
            if (img.length != 0) {
                newVal = img.attr('data-fg-content');
                oldVal = img.attr('data-fg-url');
                changed = (newVal != undefined || oldVal == '');
                if (!changed) {
                    newVal = oldVal;
                } else {
                    oldVal = uiElement.find('a').attr('href');
                }
            } else {
                changed = false;
            }
        } else if (uiElement.hasClass('fg-list-ctl-item')) {

            newVal = uiElement.data('fg-val');
            oldVal = uiElement.data('fg-org-val');
            //changed = (oldVal != newVal);
            // console.log("", { n: newVal, o: oldVal, c: changed });
        } else {
            if (uiElement.attr('type') == 'checkbox') {
                if (uiElement.is(':checked')) {
                    newVal = uiElement.val();
                }
            }
            else {
                newVal = uiElement.val();
            }
            oldVal = uiElement.data('fg-org-val')
            //changed = (oldVal != newVal);
        }
        newVal = newVal == '' ? null : newVal;
        changed = (oldVal != newVal);
        //newVal = newVal == null ? '' : newVal;

        return { NewValue: newVal, OldValue: oldVal, Changed: changed };
    },
    //-------------------------------------------------------------------------------------------
    //generate rule from v_ attribite of part jquery validation
    getXmlElementAttributeJQueryRule: function (xmlAttribute) {
        var rule_Name = xmlAttribute.name.substring(2, xmlAttribute.name.length);
        var rule_value = xmlAttribute.value;
        var rule = rule_Name + ':' + rule_value;
        return rule;
    },
    //-------------------------------------------------------------------------------------------
    //return selected attribute from current xml element
    getXmlElementAttribute: function (xmlElement, key) {
        var value = xmlElement.attr(key);
        value = (key == "errorUrl") ? '' : value;
        if (value != undefined) {
            value = $.trim(value);
        }
        return value;
    },
    //-------------------------------------------------------------------------------------------
    //return child element from current xml element
    getXmlElementChild: function (xmlElement, key) {
        return $(xmlElement).find(key)
    },
    //-------------------------------------------------------------------------------------------
    //generate new id
    getNewCtlId: function () {
        var ctlCount = $('body').data('fg-ctlCount');
        if (ctlCount == undefined) {
            ctlCount = 1;
        } else {
            ctlCount++;
        }
        $('body').data('fg-ctlCount', ctlCount);
        return 'fg-ctl-' + ctlCount;
    },
    //-------------------------------------------------------------------------------------------
    //get main container for current control
    getContainer: function (element) {
        return $(element).closest('.fg-container');
    },
    //-------------------------------------------------------------------------------------------
    //get lId from current cotainer
    getLid: function (ctl) {
        return formGenerator.getContainer(ctl).data('fg-lid');
    },
    //-------------------------------------------------------------------------------------------
    //get lId from current cotainer
    getMid: function (ctl) {
        return formGenerator.getContainer(ctl).data('fg-mid');
    },
    //-------------------------------------------------------------------------------------------
    //determine edit or read only mode
    inViewMode: function (ctl) {
        return !formGenerator.getContainer(ctl).data('fg-mode');
    },
    //-------------------------------------------------------------------------------------------
    //get options
    getOptions: function (ctl) {
        return formGenerator.getContainer(ctl).data('fg-options');
    },
    //-------------------------------------------------------------------------------------------
    //add item to list control,dataItem:{Text,Value,ValueId}
    addItemToList: function (listCtl, dataItem) {
        var part = $('<span>').addClass('fg-list-ctl-item');
        if (listCtl.hasClass('fg-list-ctl')) {
            var order = listCtl.attr('data-fg-order');
            part.addClass('fg-part-ctl fg-list-ctl-item').attr('data-fg-order', order).data('fg-val', dataItem.Value);
        } else {
            part.data('fg-data-item', dataItem);
        }
        //if ctl is text list
        if (listCtl.hasClass('fg-text-list-ctl')) {
            part.text(dataItem.Text);
        } else if (listCtl.hasClass('fg-img-list-ctl')) {
            part.append($('<img/>').attr('src', dataItem.Text));
        }
        if (!formGenerator.inViewMode(listCtl)) {
            part.append($('<a>').addClass('fg-remove').click(
                // btn delete event handler
                function () {
                    if ($(this).parent().parent().data('fg-value-id') == undefined) {
                        $(this).parent().parent().remove();
                    } else {
                        $(this).parent().removeData('fg-val').parent().hide();
                    }
                }
            ));
        }
        var newItem = $('<li>').addClass('fg-answer-ctl').append(part);
        if (dataItem.ValueId != null) {
            part.data('fg-org-val', dataItem.Value)
            newItem.data('fg-value-id', dataItem.ValueId);
        }
        var lastLI = listCtl.find('li:last');
        if (lastLI.hasClass('fg-btn-panel')) {
            lastLI.before(newItem);
        } else {
            listCtl.append(newItem);
        }
        //return item for next use
        return newItem;
    },
    //-------------------------------------------------------------------------------------------
    //add parameter in query string format to url
    addParameterToUrl: function (url, pname, pValue) {
        var startChar = '&'
        if (url.indexOf('?') < 0) {
            startChar = '?';
        }
        url += startChar + pname + '=' + pValue;
        return url;
    },
    Consts: {
        Xml: {
            UsedForId: 'usedForId',
            Class: 'class',
            LID: 'LID',
            MId: 'MId',
            MinId: 'minId',
            Multi: 'multi',
            UIType: 'uiType',
            HelpUrl: 'helpUrl',
            ErrorUrl: 'errorUrl',
            Script: 'script',
            SubmitBtnText: 'submitBtnText',
            SubmitImageUrl: 'submitImageUrl',
            SubmitLinkText: 'submitLinkText',
            SubmitClass: 'submitClass',
            Properties: {
                Collection: 'properties',
                Item: 'property',
                Id: 'prpid',
                Question: 'question',
                Multi: 'multi',
                Answer: {
                    Collection: 'answers',
                    Item: 'answer',
                    Id: 'valueId',
                    Part: {
                        Item: 'part',
                        Class: 'class',
                        Order: 'order',
                        Orientation: 'orientation',
                        Type: 'type',
                        Value: 'value',
                        Caption: 'caption',
                        Text: 'text',
                        ThumbnailUrl: 'thumbnailUrl',
                        V_FileSize: 'v_fileSize',
                        V_FileType: 'v_fileType',
                        RemoteData: {
                            Url: 'url',
                            Collection: 'fixedvalues',
                            Item: 'fixvalue',
                            DisplayMember: 'value',
                            ValueMember: 'id',
                            RelatedPrpId: 'relatedPrpId'
                        }
                    }
                }
            }
        },
        UI: {
            Templates: {
                error: '<label/>',
                text: '<input type="text" class="fg-part fg-part-ctl"/>',
                password: '<input type="password" class="fg-part fg-part-ctl"/>',
                select: '<select class="fg-select fg-remote-ctl fg-part fg-part-ctl">',
                bigText: '<textarea class="fg-part fg-part-ctl">',
                largeText: '<textarea cols="100" rows="10" class="fg-part fg-part-ctl">',
                radioList: '<div class="fg-radio-list fg-remote-ctl fg-part fg-part-ctl">',
                checkList: '<div class="fg-check-list fg-remote-ctl fg-part">',
                popup: '<button class="fg-popup-ctl fg-part-ctl" ><label /><span class="fg-image"></span></button>',
                captcha: '<div class="fg-captcha-ctl"><img class="fg-captcha"><input type="text" class="fg-part fg-part-ctl fg-answer-ctl"/></div>',
                img: '<div class="fg-img-ctl fg-part-ctl "><input type="file"/></div>',
                file: '<div class="fg-file-ctl fg-part-ctl "><input type="file"/></div>',
                textList: '<ul class="fg-list-ctl fg-text-list-ctl"></ul>',
                imgList: '<ul class="fg-list-ctl fg-img-list-ctl"></ul>'
            }

        }

    }
}

//add validator for email
$.validator.addMethod("email", function (value, element) {
    return this.optional(element) || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/i.test(value);
}, "Please enter a valid email address.");
//add validator for file size
$.validator.addMethod("fileSize", function (value, element) {
    return this.optional(element);
}, "Please Select smaller file.");
$.validator.addMethod("fileType", function (value, element) {
    return this.optional(element);
}, "Please Select Prefer file Type.");
//call from pop up for close opup and set ui
function closePopUp(refId, text, value) {

    var partCtlId = $(formGenerator.getContainer($('#' + refId)).data('fg-dialog-id')).dialog("close").data('fg-source-id');
    $('#' + partCtlId).data('fg-val', value).find('label').text(text);
}