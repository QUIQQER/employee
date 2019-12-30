/**
 * @module package/quiqqer/employee/bin/backend/controls/create/Employee
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/create/Employee', [

    'qui/QUI',
    'qui/controls/Control',
    'package/quiqqer/countries/bin/Countries',
    'Locale',
    'Ajax',
    'Mustache',

    'text!package/quiqqer/employee/bin/backend/controls/create/Employee.html',

    'css!package/quiqqer/employee/bin/backend/controls/create/Employee.css'

], function (QUI, QUIControl, Countries, QUILocale, QUIAjax, Mustache, template) {
    "use strict";

    var lg = 'quiqqer/employee';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/employee/bin/backend/controls/create/Employee',

        Binds: [
            '$onInject',
            'next',
            'previous'
        ],

        initialize: function (options) {
            this.parent(options);

            this.$Container = null;
            this.$List      = null;
            this.$Form      = null;

            this.addEvents({
                onInject: this.$onInject
            });
        },

        /**
         * event: on create
         *
         * @return {HTMLDivElement}
         */
        create: function () {
            this.$Elm = this.parent();
            this.$Elm.addClass('quiqqer-employee-create');
            this.$Elm.set('data-qui', 'package/quiqqer/employee/bin/backend/controls/create/Employee');

            this.$Elm.set('html', Mustache.render(template, {
                employeeDataHeader  : QUILocale.get(lg, 'window.employee.creation.dataHeader.title'),
                employeeDataText    : QUILocale.get(lg, 'window.employee.creation.dataHeader.text'),
                employeeGroupsHeader: QUILocale.get(lg, 'window.employee.creation.groups.title'),
                employeeGroupsText  : QUILocale.get(lg, 'window.employee.creation.groups.text'),

                textAddressCompany   : QUILocale.get('quiqqer/quiqqer', 'company'),
                textAddressSalutation: QUILocale.get('quiqqer/quiqqer', 'salutation'),
                textAddressFirstname : QUILocale.get('quiqqer/quiqqer', 'firstname'),
                textAddressLastname  : QUILocale.get('quiqqer/quiqqer', 'lastname'),
                textAddressStreet    : QUILocale.get('quiqqer/quiqqer', 'street'),
                textAddressZIP       : QUILocale.get('quiqqer/quiqqer', 'zip'),
                textAddressCity      : QUILocale.get('quiqqer/quiqqer', 'city'),
                textAddressCountry   : QUILocale.get('quiqqer/quiqqer', 'country'),

                textGroup     : QUILocale.get(lg, 'window.employee.creation.group'),
                textGroups    : QUILocale.get(lg, 'window.employee.creation.groups'),
                previousButton: QUILocale.get(lg, 'window.employee.creation.prev'),
                nextButton    : QUILocale.get(lg, 'window.employee.creation.next')
            }));

            this.$Form = this.$Elm.getElement('form');

            // key events
            var self    = this;
            var Country = this.$Elm.getElement('[name="address-country"]');

            Country.addEvent('keydown', function (event) {
                if (event.key === 'tab') {
                    event.stop();
                    self.next();
                }
            });

            this.$Container = this.$Elm.getElement('.quiqqer-employee-create-container');
            this.$List      = this.$Elm.getElement('.quiqqer-employee-create-container ul');
            this.$Next      = this.$Elm.getElement('[name="next"]');
            this.$Previous  = this.$Elm.getElement('[name="previous"]');

            this.$Next.addEvent('click', this.next);
            this.$Previous.addEvent('click', this.previous);

            return this.$Elm;
        },

        /**
         * event: on inject
         */
        $onInject: function () {
            var self  = this;
            var Group = this.$Elm.getElement('[name="group"]');

            Countries.getCountries().then(function (countries) {
                var CountrySelect = self.$Elm.getElement('[name="address-country"]');

                for (var code in countries) {
                    if (!countries.hasOwnProperty(code)) {
                        continue;
                    }

                    new Element('option', {
                        value: code,
                        html : countries[code]
                    }).inject(CountrySelect);
                }
            }).then(function () {
                return QUI.parse(self.$Elm);
            }).then(function () {
                var GroupControl = QUI.Controls.getById(Group.get('data-quiid'));

                GroupControl.disable();
            });
        },

        /**
         * Create the employee
         */
        createEmployee: function () {
            var self     = this;
            var elements = this.$Form.elements;
            var groups   = elements.groups.value.split(',');

            var address = {
                'salutation': elements['address-salutation'].value,
                'firstname' : elements['address-firstname'].value,
                'lastname'  : elements['address-lastname'].value,
                'company'   : elements['address-company'].value,
                'street_no' : elements['address-street_no'].value,
                'zip'       : elements['address-zip'].value,
                'city'      : elements['address-city'].value,
                'country'   : elements['address-country'].value
            };


            this.fireEvent('createEmployeeBegin', [this]);

            QUIAjax.post('package_quiqqer_employee_ajax_backend_create_createEmployee', function (employeeId) {
                self.fireEvent('createEmployeeEnd', [self, employeeId]);
            }, {
                'package': 'quiqqer/employee',
                address  : JSON.encode(address),
                groups   : JSON.encode(groups)
            });
        },

        /**
         * Show next step
         */
        next: function () {
            if (this.$Next.get('data-last')) {
                return this.createEmployee();
            }

            var self  = this;
            var steps = this.$List.getElements('li');
            var pos   = this.$List.getPosition(this.$Container);
            var top   = pos.y;

            var height       = this.$Container.getSize().y;
            var scrollHeight = this.$Container.getScrollSize().y;
            var newTop       = this.$roundToStepPos(top - height);

            // change last step button
            if (newTop - height <= scrollHeight * -1) {
                this.$Next.set('html', QUILocale.get(lg, 'window.employee.creation.create'));
                this.$Next.set('data-last', 1);
            }

            // check if last step
            if (newTop <= steps.length * height * -1) {
                return Promise.resolve();
            }

            return new Promise(function (resolve) {
                moofx(self.$List).animate({
                    top: newTop
                }, {
                    callback: resolve
                });
            });
        },

        /**
         * Previous next step
         */
        previous: function () {
            var self = this;
            var pos  = this.$List.getPosition(this.$Container);
            var top  = pos.y;

            var height = this.$Container.getSize().y;
            var newTop = this.$roundToStepPos(top + height);

            this.$Next.set('html', QUILocale.get(lg, 'window.employee.creation.next'));
            this.$Next.set('data-last', null);

            if (newTop > 0) {
                newTop = 0;
            }

            return new Promise(function (resolve) {
                moofx(self.$List).animate({
                    top: newTop
                }, {
                    callback: resolve
                });
            });
        },

        /**
         *
         * @param currentPos
         * @return {number}
         */
        $roundToStepPos: function (currentPos) {
            var height = this.$Container.getSize().y;
            var pos    = Math.round(currentPos / height) * -1;

            return pos * height * -1;
        }
    });
});
