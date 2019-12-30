/**
 * @module package/quiqqer/employee/bin/backend/controls/create/EmployeeWindow
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/create/EmployeeWindow', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'Locale',
    'package/quiqqer/employee/bin/backend/controls/create/Employee'

], function (QUI, QUIPopup, QUILocale, CreateEmployee) {
    "use strict";

    var lg = 'quiqqer/employee';

    return new Class({

        Extends: QUIPopup,
        Type   : 'package/quiqqer/employee/bin/backend/controls/create/EmployeeWindow',

        Binds: [
            '$onOpen'
        ],

        options: {
            maxHeight: 700,
            maxWidth : 600,
            buttons  : false
        },

        initialize: function (options) {
            this.setAttributes({
                icon : 'fa fa-id-card',
                title: QUILocale.get(lg, 'window.employee.creation.title')
            });

            this.parent(options);

            this.addEvents({
                onOpen: this.$onOpen
            });
        },

        /**
         * event: on open
         */
        $onOpen: function () {
            var self = this;

            this.getContent().set('html', '');
            this.getContent().setStyle('padding', 0);

            new CreateEmployee({
                events: {
                    onLoad: function () {
                        self.Loader.hide();
                    },

                    onCreateEmployeeBegin: function () {
                        self.Loader.show();
                    },

                    onCreateEmployeeEnd: function (Instance, employeeId) {
                        self.fireEvent('submit', [self, employeeId]);
                        self.close();
                    }
                }
            }).inject(this.getContent());
        }
    });
});
