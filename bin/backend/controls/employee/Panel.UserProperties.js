/**
 * @module package/quiqqer/employee/bin/backend/controls/employee/Panel.UserProperties
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/employee/Panel.UserProperties', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/windows/Confirm',
    'Users',
    'Ajax',
    'Locale',
    'Mustache',

    'text!package/quiqqer/employee/bin/backend/controls/employee/Panel.UserProperties.html'

], function (QUI, QUIControl, QUIConfirm, Users, QUIAjax, QUILocale, Mustache, template) {
    "use strict";

    var lg = 'quiqqer/employee';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/employee/bin/backend/controls/employee/Panel.UserProperties',

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
                title                : QUILocale.get(lg, 'employee.user.properties.title'),
                textStatus           : QUILocale.get(lg, 'employee.user.properties.status'),
                textStatusDescription: QUILocale.get(lg, 'employee.user.properties.status.description'),

                titlePassword: QUILocale.get(lg, 'employee.user.properties.password.title'),
                textPassword1: QUILocale.get(lg, 'employee.user.properties.password.1'),
                textPassword2: QUILocale.get(lg, 'employee.user.properties.password.2'),

                textSendMail      : QUILocale.get(lg, 'employee.user.information.discount.passwordMail'),
                textSendMailButton: QUILocale.get(lg, 'employee.user.information.discount.passwordMail.button'),

                titleInfo  : QUILocale.get(lg, 'employee.user.information.info'),
                userCreated: QUILocale.get('quiqqer/quiqqer', 'c_date'),
                userEdited : QUILocale.get('quiqqer/quiqqer', 'e_date'),
                lastLogin  : QUILocale.get('quiqqer/quiqqer', 'user.panel.lastLogin')
            }));

            return this.$Elm;
        },

        /**
         * event: on inject
         */
        $onInject: function () {
            var self = this;

            QUIAjax.get('package_quiqqer_employee_ajax_backend_employee_getEmployeeLoginFlag', function (login) {
                var Form = self.$Elm.getElement('form');

                if (!login) {
                    new Element('div', {
                        'class': 'messages-message message-attention',
                        html   : QUILocale.get(lg, 'message.employee.cant.log.in'),
                        styles : {
                            marginBottom: 20
                        }
                    }).inject(Form, 'top');

                    self.fireEvent('load', [self]);
                    return;
                }

                var User = Users.get(self.getAttribute('userId'));

                Form.elements.status.set('disabled', false);
                Form.elements.password1.set('disabled', false);
                Form.elements.password2.set('disabled', false);

                // dates & informations
                var lastEdit  = parseInt(User.getAttribute('lastvisit'));
                var Formatter = QUILocale.getDateTimeFormatter();
                var LastEdit  = new window.Date(lastEdit * 1000);

                Form.elements.lastLogin.value = Formatter.format(LastEdit);

                if (parseInt(User.getAttribute('regdate'))) {
                    try {
                        Form.elements.c_date.value = Formatter.format(
                            new window.Date(User.getAttribute('regdate') * 1000)
                        );
                    } catch (e) {
                        Form.elements.c_date.value = '---';
                    }
                } else {
                    Form.elements.c_date.value = '---';
                }

                if (parseInt(User.getAttribute('lastedit'))) {
                    try {
                        Form.elements.e_date.value = Formatter.format(
                            new window.Date(User.getAttribute('lastedit'))
                        );
                    } catch (e) {
                        Form.elements.e_date.value = '---';
                    }
                } else {
                    Form.elements.e_date.value = '---';
                }

                Form.elements.password1.addEvent('blur', function () {
                    if (Form.elements.password1.value !== Form.elements.password2.value) {
                        Form.elements.password2.focus();
                    }
                });

                Form.elements.password2.addEvent('blur', function () {
                    if (Form.elements.password1.value !== Form.elements.password2.value) {
                        QUI.getMessageHandler().then(function (MH) {
                            MH.addError(
                                QUILocale.get(lg, 'message.passwords.incorrect'),
                                Form.elements.password2
                            );
                        });
                    }
                });

                Form.elements.passwordMail.addEvent('click', function (event) {
                    event.stop();
                    self.passwordResetMail();
                });

                self.fireEvent('load', [self]);
            }, {
                'package': 'quiqqer/employee'
            });
        },

        /**
         * password reset confirmation window
         * -> send a password reset mail to the user
         */
        passwordResetMail: function () {
            var self = this;

            new QUIConfirm({
                icon       : 'fa fa-envelope',
                texticon   : 'fa fa-envelope',
                title      : QUILocale.get(lg, 'password.mail.window.title'),
                text       : QUILocale.get(lg, 'password.mail.window.text'),
                information: QUILocale.get(lg, 'password.mail.window.information'),
                maxHeight  : 300,
                maxWidth   : 600,
                autoclose  : false,
                ok_button  : {
                    text     : QUILocale.get(lg, 'password.mail.window.submit'),
                    textimage: 'fa fa-envelope'
                },
                events     : {
                    onSubmit: function (Win) {
                        Win.Loader.show();

                        QUIAjax.post('package_quiqqer_employee_ajax_backend_employee_passwordMail', function () {
                            Win.close();
                        }, {
                            'package': 'quiqqer/employee',
                            userId   : self.getAttribute('userId')
                        });
                    }
                }
            }).open();
        }
    });
});
