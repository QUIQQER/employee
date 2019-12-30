/**
 * @module package/quiqqer/employee/bin/backend/controls/employee/Panel.UserInformation
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/employee/Panel.UserInformation', [

    'qui/QUI',
    'qui/controls/Control',
    'Ajax',
    'Locale',
    'Users',
    'Mustache',

    'text!package/quiqqer/employee/bin/backend/controls/employee/Panel.UserInformation.html'

], function (QUI, QUIControl, QUIAjax, QUILocale, Users, Mustache, template) {
    "use strict";

    var lg = 'quiqqer/employee';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/employee/bin/backend/controls/employee/Panel.UserInformation',

        Binds: [
            '$onInject'
        ],

        options: {
            userId: false
        },

        initialize: function (options) {
            this.parent(options);

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

            this.$Elm.set('html', Mustache.render(template, {
                title       : QUILocale.get(lg, 'employee.user.information.title'),
                titleGeneral: QUILocale.get(lg, 'employee.user.information.general'),
                textLanguage: QUILocale.get('quiqqer/quiqqer', 'language'),

                textSendMail      : QUILocale.get(lg, 'employee.user.information.discount.passwordMail'),
                textSendMailButton: QUILocale.get(lg, 'employee.user.information.discount.passwordMail.button')
            }));

            return this.$Elm;
        },

        /**
         * event: on inject
         */
        $onInject: function () {
            var self = this;
            var User = Users.get(this.getAttribute('userId'));
            var Form = this.$Elm.getElement('form');

            Promise.all([
                this.getLanguages()
            ]).then(function (result) {
                var languages = result[0];
                var LangElm   = Form.elements.lang;

                for (var i = 0, len = languages.length; i < len; i++) {
                    new Element('option', {
                        html : QUILocale.get('quiqqer/quiqqer', 'language.' + languages[i]),
                        value: languages[i]
                    }).inject(LangElm);
                }

                Form.elements.lang.value = User.getAttribute('lang');
            }).then(function () {
                return QUI.parse(self.getElm());
            }).then(function () {
                self.fireEvent('load', [self]);
            });
        },

        /**
         * return the available languages
         *
         * @return {Promise}
         */
        getLanguages: function () {
            return new Promise(function (resolve) {
                require(['package/quiqqer/translator/bin/Translator'], function (Translator) {
                    Translator.getAvailableLanguages().then(resolve);
                });
            });
        }
    });
});
