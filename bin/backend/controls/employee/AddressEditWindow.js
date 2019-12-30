/**
 * @module package/quiqqer/employee/bin/backend/controls/employee/AddressEditWindow
 * @author www.csg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/employee/AddressEditWindow', [

    'qui/QUI',
    'qui/controls/windows/Confirm',
    'package/quiqqer/employee/bin/backend/controls/employee/AddressEdit',
    'Locale',

    'css!package/quiqqer/employee/bin/backend/controls/employee/AddressEditWindow.css'

], function (QUI, QUIConfirm, AddressEdit, QUILocale) {
    "use strict";

    return new Class({

        Extends: QUIConfirm,
        Type   : 'package/quiqqer/employee/bin/backend/controls/employee/AddressEditWindow',

        Binds: [
            '$onOpen'
        ],

        options: {
            addressId: false,
            maxHeight: 500,
            maxWidth : 600,
            autoclose: false,
            icon     : 'fa fa-share'
        },

        initialize: function (options) {
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

            this.Loader.show();
            this.getContent().set('html', '');
            this.getContent().addClass('quiqqer-employee-window-edit-address');

            this.$Address = new AddressEdit({
                addressId: this.getAttribute('addressId'),
                events   : {
                    onLoad: function () {
                        var firstname = self.$Address.getFirstname();
                        var lastname  = self.$Address.getLastname();

                        if (firstname === '' && lastname === '') {
                            firstname = '---';
                        }

                        self.setAttribute('title', QUILocale.get('quiqqer/employee', 'address.edit.window.title', {
                            id       : self.$Address.getAddressId(),
                            firstname: firstname,
                            lastname : lastname
                        }));

                        self.refresh();

                        self.fireEvent('load', [self]);
                        self.Loader.hide();
                    }
                }
            }).inject(this.getContent());
        },

        /**
         * submit
         */
        submit: function () {
            var self = this;

            this.Loader.show();

            this.$Address.update().then(function () {
                self.fireEvent('submit', [self]);
                self.close();
            });
        }
    });
});
