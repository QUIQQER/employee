/**
 * @module package/quiqqer/employee/bin/backend/controls/employee/Panel.Comments
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/employee/Panel.Comments', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',
    'qui/controls/windows/Confirm',
    'package/quiqqer/erp/bin/backend/controls/Comments',
    'Permissions',
    'Ajax',
    'Locale'

], function (QUI, QUIControl, QUIButton, QUIConfirm, Comments, Permissions, QUIAjax, QUILocale) {
    "use strict";

    var lg = 'quiqqer/employee';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/employee/bin/backend/controls/employee/Panel.Comments',

        Binds: [
            'addComment',
            '$onInject'
        ],

        options: {
            userId: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$Comments         = null;
            this.$AddCommentButton = null;

            this.$editComments = false;

            this.addEvents({
                onInject: this.$onInject
            });
        },

        /**
         * Return the DOMNode Element
         *
         * @return {HTMLDivElement}
         */
        create: function () {
            this.$Elm = this.parent();

            this.$AddCommentButton = new QUIButton({
                textimage: 'fa fa-comment',
                text     : QUILocale.get(lg, 'window.add.comment.button.text'),
                styles   : {
                    'float': 'right'
                },
                events   : {
                    onClick: this.addComment
                }
            });

            this.$AddCommentButton.inject(this.$Elm);
            new Element('section').inject(this.$Elm);

            return this.$Elm;
        },

        /**
         * event: on inject
         */
        $onInject: function () {
            var self = this;

            Permissions.hasPermission('quiqqer.employee.editComments').then(function (editComments) {
                self.$editComments = editComments;

                if (!self.$editComments) {
                    self.$AddCommentButton.disable();
                }

                return self.refresh();
            }).then(function () {
                self.fireEvent('load', [self]);
            });
        },

        /**
         * refresh the comments
         *
         * @return {Promise}
         */
        refresh: function (comments) {
            var self    = this;
            var Section = this.$Elm.getElement('section');

            Section.set('html', '');

            this.$Comments = new Comments(comments);
            this.$Comments.inject(Section);
            this.$Comments.addEvents({
                onEdit: function (Instance, Comment, data) {
                    self.editComment(data.id, data.source);
                }
            });

            if (typeof comments !== 'undefined') {
                comments = comments.reverse();
                self.$Comments.unserialize(comments);

                return Promise.resolve();
            }

            return this.getComments().then(function (comments) {
                comments = comments.reverse();
                self.$Comments.unserialize(comments);
            });
        },

        /**
         * return all comments for the user
         *
         * @return {Promise}
         */
        getComments: function () {
            var self = this;

            return new Promise(function (resolve) {
                QUIAjax.get('package_quiqqer_employee_ajax_backend_employee_getComments', resolve, {
                    'package': 'quiqqer/employee',
                    uid      : self.getAttribute('userId')
                });
            });
        },

        /**
         * add a comment
         */
        addComment: function () {
            var self = this;

            new QUIConfirm({
                icon     : 'fa fa-comment',
                title    : QUILocale.get(lg, 'window.add.comment.title'),
                maxHeight: 400,
                maxWidth : 700,
                autoclose: false,
                events   : {
                    onOpen: function (Win) {
                        Win.getContent().set('html', '');

                        var Textarea = new Element('textarea', {
                            styles: {
                                height: '98%',
                                width : '100%'
                            }
                        }).inject(Win.getContent());

                        Textarea.focus();
                    },

                    onSubmit: function (Win) {
                        Win.Loader.show();

                        var comment = Win.getContent().getElement('textarea').value;

                        QUIAjax.post('package_quiqqer_employee_ajax_backend_employee_addComment', function (comments) {
                            Win.close();
                            self.refresh(comments);
                        }, {
                            'package': 'quiqqer/employee',
                            userId   : self.getAttribute('userId'),
                            comment  : comment
                        });
                    }
                }
            }).open();
        },

        /**
         * edit a comment
         *
         * @param {String} commentId
         * @param {String} source
         */
        editComment: function (commentId, source) {
            var self = this;

            new QUIConfirm({
                icon     : 'fa fa-comment',
                title    : QUILocale.get(lg, 'window.edit.comment.title'),
                maxHeight: 400,
                maxWidth : 700,
                autoclose: false,
                events   : {
                    onOpen: function (Win) {
                        Win.Loader.show();
                        Win.getContent().set('html', '');

                        var Textarea = new Element('textarea', {
                            styles: {
                                height: '98%',
                                width : '100%'
                            }
                        }).inject(Win.getContent());

                        QUIAjax.get('package_quiqqer_employee_ajax_backend_employee_getComment', function (comment) {
                            Textarea.value = comment;
                            Textarea.focus();
                            Win.Loader.hide();
                        }, {
                            'package': 'quiqqer/employee',
                            userId   : self.getAttribute('userId'),
                            commentId: commentId,
                            source   : source
                        });
                    },

                    onSubmit: function (Win) {
                        Win.Loader.show();

                        var comment = Win.getContent().getElement('textarea').value;

                        QUIAjax.post('package_quiqqer_employee_ajax_backend_employee_editComment', function (comments) {
                            Win.close();
                            self.refresh(comments);
                        }, {
                            'package': 'quiqqer/employee',
                            userId   : self.getAttribute('userId'),
                            commentId: commentId,
                            source   : source,
                            comment  : comment
                        });
                    }
                }
            }).open();
        }
    });
});
