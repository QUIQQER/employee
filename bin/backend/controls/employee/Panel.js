/**
 * @module package/quiqqer/employee/bin/backend/controls/employee/Panel
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/employee/Panel', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/ButtonSwitch',
    'qui/controls/windows/Confirm',
    'package/quiqqer/countries/bin/Countries',
    'package/quiqqer/payments/bin/backend/Payments',
    'qui/utils/Form',
    'Users',
    'Locale',
    'Ajax',
    'Packages',
    'Mustache',

    'text!package/quiqqer/employee/bin/backend/controls/employee/Panel.Information.html',
    'css!package/quiqqer/employee/bin/backend/controls/employee/Panel.css'

], function (QUI, QUIPanel, QUIButtonSwitch, QUIConfirm, Countries, Payments,
             FormUtils, Users, QUILocale, QUIAjax, Packages, Mustache, templateInformation) {
    "use strict";

    var lg = 'quiqqer/employee';

    var paymentsInstalled = false;
    var shippingInstalled = false;

    return new Class({

        Extends: QUIPanel,
        Type   : 'package/quiqqer/employee/bin/backend/controls/employee/Panel',

        Binds: [
            '$onCreate',
            '$onDestroy',
            '$onShow',
            '$onSaveClick',
            '$onDeleteClick',
            '$clickEditAddress',
            '$openCategory',
            '$openAddressManagement',
            '$onUserDelete',
            '$onEmployeeCategoryActive',
            'openUser',
            'deliveryAddressToggle'
        ],

        options: {
            icon            : 'fa fa-user',
            userId          : false,
            showUserButton  : true,
            showDeleteButton: true
        },

        initialize: function (parent) {
            this.parent(parent);

            this.setAttribute('#id', 'employee-panel-' + this.getAttribute('userId'));

            this.$User               = null;
            this.$userInitAttributes = null;

            this.addEvents({
                onCreate : this.$onCreate,
                onDestroy: this.$onDestroy,
                onShow   : this.$onShow
            });

            Users.addEvent('onDelete', this.$onUserDelete);
        },

        /**
         * the panel on destroy event
         * remove the binded events
         */
        $onDestroy: function () {
            Users.removeEvent('delete', this.$onUserDelete);
        },

        //region actions

        /**
         * alias for update
         *
         * @return {Promise}
         */
        save: function () {
            return this.update();
        },

        /**
         * Saves / Update the user
         */
        update: function () {
            var self = this;

            this.Loader.show();
            this.$categoryUnload();

            return new Promise(function (resolve) {
                QUIAjax.post('package_quiqqer_employee_ajax_backend_employee_save', resolve, {
                    'package': 'quiqqer/employee',
                    userId   : self.$User.getId(),
                    data     : JSON.encode(self.$User.getAttributes()),
                    onError  : resolve
                });
            }).then(function () {
                return self.$refreshTitle();
            }).then(function () {
                self.Loader.hide();
            });
        },

        /**
         * open the use panel
         */
        openUser: function () {
            var self = this;

            require([
                'controls/users/User',
                'utils/Panels'
            ], function (User, Utils) {
                Utils.openPanelInTasks(
                    new User(self.getAttribute('userId'))
                );
            });
        },

        //endregion

        /**
         * event: on create
         */
        $onCreate: function () {
            var self = this;

            this.getElm().addClass('quiqqer-employee-panel');

            // buttons
            this.addButton({
                name     : 'userSave',
                text     : QUILocale.get('quiqqer/quiqqer', 'users.user.btn.save'),
                textimage: 'fa fa-save',
                events   : {
                    onClick: this.$onSaveClick
                }
            });

            if (this.getAttribute('showDeleteButton')) {
                this.addButton({
                    name  : 'userDelete',
                    title : QUILocale.get('quiqqer/quiqqer', 'users.user.btn.delete'),
                    icon  : 'fa fa-trash-o',
                    events: {
                        onClick: this.$onDeleteClick
                    },
                    styles: {
                        'float': 'right'
                    }
                });
            }

            if (this.getAttribute('showUserButton')) {
                this.addButton({
                    name  : 'openUser',
                    title : QUILocale.get(lg, 'quiqqer.employee.panel.openUser'),
                    icon  : 'fa fa-user',
                    events: {
                        onClick: this.openUser
                    },
                    styles: {
                        'float': 'right'
                    }
                });
            }

            // categories
            this.addCategory({
                name  : 'information',
                text  : QUILocale.get(lg, 'quiqqer.employee.panel.general'),
                icon  : 'fa fa-file',
                events: {
                    onActive: function () {
                        self.$openCategory('information');
                    }
                }
            });

            this.addCategory({
                name  : 'userInformation',
                text  : QUILocale.get(lg, 'quiqqer.employee.panel.userInformation'),
                icon  : 'fa fa-user',
                events: {
                    onActive: function () {
                        self.$openCategory('userInformation');
                    }
                }
            });

            this.addCategory({
                name  : 'userProperty',
                text  : QUILocale.get(lg, 'quiqqer.employee.panel.userProperty'),
                icon  : 'fa fa-user',
                events: {
                    onActive: function () {
                        self.$openCategory('userProperty');
                    }
                }
            });

            this.addCategory({
                name  : 'addresses',
                text  : QUILocale.get(lg, 'quiqqer.employee.panel.addresses'),
                icon  : 'fa fa-address-card-o',
                events: {
                    onActive: function () {
                        self.$openCategory('addresses');
                    }
                }
            });

            this.addCategory({
                name  : 'comments',
                text  : QUILocale.get(lg, 'quiqqer.employee.panel.comments'),
                icon  : 'fa fa-comments',
                events: {
                    onActive: function () {
                        self.$openCategory('comments');
                    }
                }
            });

            this.addCategory({
                name  : 'files',
                text  : QUILocale.get(lg, 'quiqqer.employee.panel.files'),
                icon  : 'fa fa-file-text-o',
                events: {
                    onActive: function () {
                        self.$openCategory('files');
                    }
                }
            });

            this.getContent().setStyle('opacity', 0);

            QUIAjax.get('package_quiqqer_employee_ajax_backend_employee_getCategories', function (result) {
                var categories = result.categories;

                for (var i = 0, len = categories.length; i < len; i++) {
                    categories[i].events = {
                        onActive: self.$onEmployeeCategoryActive
                    };

                    self.addCategory(categories[i]);
                }
            }, {
                package: 'quiqqer/employee'
            });
        },

        /**
         * event: on show
         */
        $onShow: function () {
            this.Loader.show();

            this.setAttribute('icon', 'fa fa-spinner fa-spin');
            this.refresh();

            var self   = this;
            var User   = Users.get(this.getAttribute('userId'));
            var Loaded = Promise.resolve(User);

            if (!User.isLoaded()) {
                Loaded = User.load();
            }

            return Loaded.then(function (User) {
                self.$User               = User;
                self.$userInitAttributes = User.getAttributes();

                // check installed
                return Packages.getPackage('quiqqer/payments').catch(function () {
                    return false;
                });
            }).then(function (paymentPkg) {
                if (paymentPkg) {
                    paymentsInstalled = true;
                }

                return Packages.getPackage('quiqqer/shipping').catch(function () {
                    return false;
                });
            }).then(function (shippingPkg) {
                if (shippingPkg) {
                    shippingInstalled = true;
                }

                return self.$refreshTitle();
            }).then(function () {
                if (!self.$ActiveCat) {
                    self.getCategory('information').click();
                }

                self.Loader.hide();
            });
        },

        /**
         * Refresh the panel title
         *
         * @return {Promise}
         */
        $refreshTitle: function () {
            if (this.getAttribute('header') === false) {
                return Promise.resolve();
            }

            var self    = this;
            var address = false;

            this.setAttribute('icon', 'fa fa-spinner fa-spin');
            this.refresh();

            if (parseInt(this.$User.getAttribute('address'))) {
                address = parseInt(this.$User.getAttribute('address'));
            } else if (this.$User.getAttribute('quiqqer.erp.address')) {
                address = parseInt(this.$User.getAttribute('quiqqer.erp.address'));
            }

            var GetAddress;

            if (!address) {
                GetAddress = this.getAddressDefaultAddress();
            } else {
                GetAddress = this.getAddress(address);
            }

            return GetAddress.then(function (addressData) {
                var titleData = [];

                if (self.$User.getUsername() === self.$User.getName()) {
                    titleData.push(self.$User.getUsername());
                } else {
                    titleData.push(self.$User.getUsername());
                    titleData.push(self.$User.getName());
                }

                if (self.$User.getAttribute('email') && self.$User.getAttribute('email') !== '') {
                    titleData.push(self.$User.getAttribute('email'));
                }

                if (addressData && addressData.text !== ' ; ; ' && addressData.text !== '') {
                    titleData.push(addressData.text);
                }

                self.setAttribute('icon', 'fa fa-user');
                self.setAttribute('title', QUILocale.get(lg, 'employee.panel.title', {
                    data: titleData.join(' - ')
                }));

                self.refresh();
            });
        },

        //region information

        /**
         * opens the user information
         */
        $openInformation: function () {
            this.getContent().set('html', Mustache.render(templateInformation, {
                detailsTitle      : QUILocale.get(lg, 'employee.panel,information.details'),
                textUserId        : QUILocale.get('quiqqer/quiqqer', 'user_id'),
                textEmployeeId    : QUILocale.get(lg, 'employeeId'),
                textSalutation    : QUILocale.get('quiqqer/quiqqer', 'salutation'),
                textFirstname     : QUILocale.get('quiqqer/quiqqer', 'firstname'),
                textLastname      : QUILocale.get('quiqqer/quiqqer', 'lastname'),
                titleAddress      : QUILocale.get('quiqqer/quiqqer', 'address'),
                textStreet        : QUILocale.get('quiqqer/quiqqer', 'street'),
                textCountryZipCity: QUILocale.get(lg, 'employee.panel,information.countryZipCity'),
                textCountry       : QUILocale.get('quiqqer/quiqqer', 'country'),
                textZip           : QUILocale.get('quiqqer/quiqqer', 'zip'),
                textCity          : QUILocale.get('quiqqer/quiqqer', 'city'),
                titleAllocation   : QUILocale.get(lg, 'employee.panel,information.allocation'),
                textGroup         : QUILocale.get(lg, 'employee.panel,information.group'),
                textGroups        : QUILocale.get(lg, 'employee.panel,information.groups'),
                titleCommunication: QUILocale.get(lg, 'employee.panel,information.communication'),
                titleComments     : QUILocale.get(lg, 'employee.panel,information.comments'),

                titleExtra     : QUILocale.get(lg, 'employee.panel,information.extra'),
                textPaymentTerm: QUILocale.get(lg, 'employee.panel,information.paymentTerm'),
                textMail       : QUILocale.get('quiqqer/quiqqer', 'email'),
                textTel        : QUILocale.get('quiqqer/quiqqer', 'tel'),
                textFax        : QUILocale.get('quiqqer/quiqqer', 'fax'),
                textInternet   : QUILocale.get(lg, 'employee.panel,information.extra.homepage'),

                // payments
                payments           : paymentsInstalled,
                textStandardPayment: QUILocale.get(lg, 'employee.panel,information.standard.payments'),

                // shipping
                titleDeliveryAddress   : QUILocale.get(lg, 'employee.panel.delivery.address'),
                shipping               : shippingInstalled,
                textDeliveryAddressSame: QUILocale.get(lg, 'checkout.panel.delivery.option.same')
            }));

            var UserLoaded = Promise.resolve();

            if (!this.$User) {
                UserLoaded = this.$onShow();
            }

            var self = this,
                Form = this.getContent().getElement('form');

            var checkVal = function (str) {
                if (!str || str === 'false') {
                    return '';
                }

                return str;
            };

            var address, delivery;

            // set data
            UserLoaded.then(function () {
                Form.elements.userId.value = self.$User.getId();

                if (self.$User.getAttribute('employeeId')) {
                    Form.elements.employeeId.value = checkVal(self.$User.getAttribute('employeeId'));
                }

                // groups
                Form.elements.groups.value = self.$User.getAttribute('usergroup');
                Form.elements.group.value  = self.$User.getAttribute('mainGroup');

                Form.elements['quiqqer.erp.employee.website'].value      = checkVal(self.$User.getAttribute('quiqqer.erp.employee.website'));
                Form.elements['quiqqer.erp.employee.payment.term'].value = checkVal(self.$User.getAttribute('quiqqer.erp.employee.payment.term'));

                // address
                address  = parseInt(self.$User.getAttribute('address'));
                delivery = self.$User.getAttribute('quiqqer.delivery.address');

                if (!delivery && shippingInstalled) {
                    Form.elements['address-delivery'].checked = true;
                    Form.elements['address-delivery'].addEvent('change', self.deliveryAddressToggle);
                    self.deliveryAddressToggle();
                }

                return Countries.getCountries();
            }).then(function (countries) {
                var CountrySelect         = Form.elements['address-country'];
                var CountrySelectDelivery = Form.elements['address-delivery-country'];

                for (var code in countries) {
                    if (!countries.hasOwnProperty(code)) {
                        continue;
                    }

                    new Element('option', {
                        value: code,
                        html : countries[code]
                    }).inject(CountrySelect);

                    if (CountrySelectDelivery) {
                        new Element('option', {
                            value: code,
                            html : countries[code]
                        }).inject(CountrySelectDelivery);
                    }
                }

                if (!address) {
                    return self.getAddressDefaultAddress();
                }

                return self.getAddress(address);
            }).then(function (address) {
                if (!address) {
                    return;
                }

                Form.elements['address-salutation'].value = address.salutation;
                Form.elements['address-firstname'].value  = address.firstname;
                Form.elements['address-lastname'].value   = address.lastname;
                Form.elements['address-street_no'].value  = address.street_no;
                Form.elements['address-zip'].value        = address.zip;
                Form.elements['address-country'].value    = address.country;
                Form.elements['address-city'].value       = address.city;

                try {
                    var CBody = self.getElm().getElement('.employee-information-communication-body');
                    var phone = JSON.decode(address.phone);

                    if (self.$User.getAttribute('address-communication')) {
                        phone = self.$User.getAttribute('address-communication');
                    }

                    var i, len, Row;

                    var rows   = [],
                        tel    = false,
                        fax    = false,
                        mobile = false;

                    for (i = 0, len = phone.length; i < len; i++) {
                        Row = new Element('tr', {
                            'data-type': phone[i].type,
                            html       : '<td>' +
                                '<label class="field-container">' +
                                '   <span class="field-container-item">' + QUILocale.get('quiqqer/quiqqer', phone[i].type) + '</span>' +
                                '   <input name="address-communication" class="field-container-field"/>' +
                                '</label>' +
                                '</td>'
                        });

                        Row.getElement('input').set('value', phone[i].no);
                        Row.getElement('input').set('data-type', phone[i].type);

                        switch (phone[i].type) {
                            case 'tel':
                                tel = true;
                                break;
                            case 'fax':
                                fax = true;
                                break;
                            case 'mobile':
                                mobile = true;
                                break;
                        }

                        rows.push(Row);
                    }

                    if (tel === false) {
                        rows.push(
                            new Element('tr', {
                                'data-type': 'tel',
                                html       : '<td>' +
                                    '<label class="field-container">' +
                                    '   <span class="field-container-item">' + QUILocale.get('quiqqer/quiqqer', 'tel') + '</span>' +
                                    '   <input name="address-communication" data-type="tel" class="field-container-field"/>' +
                                    '</label>' +
                                    '</td>'
                            })
                        );
                    }

                    if (fax === false) {
                        rows.push(
                            new Element('tr', {
                                'data-type': 'fax',
                                html       : '<td>' +
                                    '<label class="field-container">' +
                                    '   <span class="field-container-item">' + QUILocale.get('quiqqer/quiqqer', 'fax') + '</span>' +
                                    '   <input name="address-communication" data-type="fax" class="field-container-field"/>' +
                                    '</label>' +
                                    '</td>'
                            })
                        );
                    }

                    if (mobile === false) {
                        rows.push(
                            new Element('tr', {
                                'data-type': 'mobile',
                                html       : '<td>' +
                                    '<label class="field-container">' +
                                    '   <span class="field-container-item">' + QUILocale.get('quiqqer/quiqqer', 'mobile') + '</span>' +
                                    '   <input name="address-communication" data-type="mobile" class="field-container-field"/>' +
                                    '</label>' +
                                    '</td>'
                            })
                        );
                    }

                    rows.sort(function (a, b) {
                        return a.get('data-type').localeCompare(b.get('data-type')) * -1;
                    });

                    rows.forEach(function (R) {
                        R.inject(CBody);
                    });
                } catch (e) {
                }
            }).then(function () {
                // delivery address
                if (!delivery) {
                    return;
                }

                return self.getAddress(delivery).then(function (deliveryData) {
                    Form.elements['address-delivery-salutation'].value = deliveryData.salutation;
                    Form.elements['address-delivery-firstname'].value  = deliveryData.firstname;
                    Form.elements['address-delivery-lastname'].value   = deliveryData.lastname;
                    Form.elements['address-delivery-street_no'].value  = deliveryData.street_no;
                    Form.elements['address-delivery-zip'].value        = deliveryData.zip;
                    Form.elements['address-delivery-country'].value    = deliveryData.country;
                    Form.elements['address-delivery-city'].value       = deliveryData.city;
                });
            }).then(function () {
                // load comments
                self.getComments().then(function (comments) {
                    require(['package/quiqqer/erp/bin/backend/controls/Comments'], function (Comments) {
                        var Container = self.getContent().getElement('.comments');

                        if (!Container) {
                            return;
                        }

                        Container.set('html', '');

                        comments = comments.reverse();
                        comments = comments.slice(0, 5);

                        var Control = new Comments();
                        Control.inject(Container);
                        Control.unserialize(comments);
                    });
                });

                return QUI.parse(self.getContent());
            }).then(function () {
                if (paymentsInstalled === false) {
                    return;
                }

                var PaymentSelect = self.getContent().getElement('[name="quiqqer.erp.standard.payment"]'),
                    lang          = QUILocale.getCurrent();

                if (!PaymentSelect) {
                    return;
                }

                // standard payment
                return new Promise(function (resolve) {
                    PaymentSelect.set('html', '');

                    new Element('option', {
                        value: '',
                        html : '---'
                    }).inject(PaymentSelect);

                    require([
                        'package/quiqqer/payments/bin/backend/Payments'
                    ], function (Payments) {
                        Payments.getPayments().then(function (payments) {
                            var i, len, text;
                            for (i = 0, len = payments.length; i < len; i++) {
                                text = '';

                                if (typeof payments[i].title[lang] !== 'undefined') {
                                    text = payments[i].title[lang];
                                } else if (typeof payments[i].title.en === 'undefined') {
                                    text = payments[i].title.en;
                                }

                                new Element('option', {
                                    value: payments[i].id,
                                    html : text
                                }).inject(PaymentSelect);
                            }

                            if (self.$User.getAttribute('quiqqer.erp.standard.payment')) {
                                PaymentSelect.value = self.$User.getAttribute('quiqqer.erp.standard.payment');
                            }
                        }).then(resolve);
                    });
                });
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
                    uid      : self.$User.getId()
                });
            });
        },

        /**
         * Edit an address
         * - opens the edit address window
         *
         * @param addressId
         * @return {Promise}
         */
        editAddress: function (addressId) {
            var self = this;

            require([
                'package/quiqqer/employee/bin/backend/controls/employee/AddressEditWindow'
            ], function (AddressEditWindow) {
                new AddressEditWindow({
                    addressId: addressId,
                    events   : {
                        onSubmit: function () {
                            self.Loader.show();

                            self.refreshAddressLists().then(function () {
                                self.Loader.hide();
                            });
                        }
                    }
                }).open();
            });
        },

        /**
         * Create a new address for this user
         *
         * @return {Promise}
         */
        createAddress: function () {
            var self = this;

            return new Promise(function (resolve) {
                QUIAjax.post('ajax_users_address_save', resolve, {
                    uid : self.$User.getId(),
                    aid : 0,
                    data: '[]'
                });
            });
        },

        /**
         * Refresh the address lists
         *
         * @return {Promise}
         */
        refreshAddressLists: function () {
            this.$User.$addresses = false; // workaround for refresh

            var self            = this;
            var DefaultAddress  = this.getContent().getElement('[name="address"]');
            var InvoiceAddress  = this.getContent().getElement('[name="quiqqer.erp.address"]');
            var DeliveryAddress = this.getContent().getElement('[name="quiqqer.delivery.address"]');

            // set addresses
            return this.$User.getAddressList().then(function (addressList) {
                DefaultAddress.innerHTML  = '';
                InvoiceAddress.innerHTML  = '';
                DeliveryAddress.innerHTML = '';

                new Element('option', {
                    html : '',
                    value: ''
                }).inject(DefaultAddress);

                new Element('option', {
                    html : '',
                    value: ''
                }).inject(InvoiceAddress);

                new Element('option', {
                    html : '',
                    value: ''
                }).inject(DeliveryAddress);

                for (var i = 0, len = addressList.length; i < len; i++) {
                    new Element('option', {
                        html : addressList[i].text,
                        value: parseInt(addressList[i].id)
                    }).inject(DefaultAddress);

                    new Element('option', {
                        html : addressList[i].text,
                        value: parseInt(addressList[i].id)
                    }).inject(InvoiceAddress);

                    new Element('option', {
                        html : addressList[i].text,
                        value: parseInt(addressList[i].id)
                    }).inject(DeliveryAddress);
                }

                var attributes      = self.$User.getAttributes(),
                    address         = parseInt(attributes.address),
                    invoiceAddress  = parseInt(attributes['quiqqer.erp.address']),
                    deliveryAddress = parseInt(attributes['quiqqer.delivery.address']);

                if (address) {
                    DefaultAddress.value = address;
                    DefaultAddress.getNext('button').set('disabled', false);
                }

                if (invoiceAddress) {
                    InvoiceAddress.value = invoiceAddress;
                    InvoiceAddress.getNext('button').set('disabled', false);
                }

                if (deliveryAddress) {
                    DeliveryAddress.value = deliveryAddress;
                    DeliveryAddress.getNext('button').set('disabled', false);
                }
            });
        },

        //endregion

        //region address

        /**
         *
         * @param {Integer} addressId
         * @return {Promise}
         */
        getAddress: function (addressId) {
            addressId = parseInt(addressId);

            return this.$User.getAddressList().then(function (addressList) {
                for (var i = 0, len = addressList.length; i < len; i++) {
                    if (parseInt(addressList[i].id) === addressId) {
                        return addressList[i];
                    }
                }

                return false;
            });
        },

        /**
         * Return the default address
         *
         * @return {Promise}
         */
        getAddressDefaultAddress: function () {
            var self = this;

            return new Promise(function (resolve) {
                QUIAjax.get('package_quiqqer_employee_ajax_backend_employee_getAddress', resolve, {
                    'package': 'quiqqer/employee',
                    userId   : self.$User.getId()
                });
            });
        },

        /**
         * open the address management
         *
         * @return {Promise}
         */
        $openAddressManagement: function () {
            var self = this;

            this.getContent().set('html', '');

            return new Promise(function (resolve) {
                require(['package/quiqqer/employee/bin/backend/controls/employee/AddressGrid'], function (AddressGrid) {
                    var Instance = new AddressGrid({
                        userId: self.getAttribute('userId')
                    }).inject(self.getContent());

                    Instance.resize();

                    resolve();
                });
            });
        },

        //endregion

        //region category stuff

        /**
         * open the comments
         *
         * @return {Promise}
         */
        $openComments: function () {
            var self = this;

            this.getContent().set('html', '');

            return new Promise(function (resolve) {
                require(['package/quiqqer/employee/bin/backend/controls/employee/Panel.Comments'], function (Comments) {
                    new Comments({
                        userId: self.getAttribute('userId'),
                        events: {
                            onLoad: resolve
                        }
                    }).inject(self.getContent());
                });
            });
        },

        /**
         * open the user information
         *
         * @return {Promise}
         */
        $openUserInformation: function () {
            var self = this;

            this.getContent().set('html', '');

            return new Promise(function (resolve) {
                require([
                    'package/quiqqer/employee/bin/backend/controls/employee/Panel.UserInformation'
                ], function (UserInformation) {
                    new UserInformation({
                        userId: self.getAttribute('userId'),
                        events: {
                            onLoad: resolve
                        }
                    }).inject(self.getContent());
                });
            });
        },

        /**
         * open the user properties
         *
         * @return {Promise}
         */
        $openUserProperty: function () {
            var self = this;

            this.getContent().set('html', '');

            return new Promise(function (resolve) {
                require([
                    'package/quiqqer/employee/bin/backend/controls/employee/Panel.UserProperties'
                ], function (UserProperties) {
                    new UserProperties({
                        userId: self.getAttribute('userId'),
                        events: {
                            onLoad: resolve
                        }
                    }).inject(self.getContent());
                });
            });
        },

        /**
         * open the user files
         *
         * @return {Promise}
         */
        $openFiles: function () {
            var self = this;

            this.getContent().set('html', '');

            return new Promise(function (resolve) {
                require([
                    'package/quiqqer/employee/bin/backend/controls/employee/Panel.UserFiles'
                ], function (UserFiles) {
                    new UserFiles({
                        userId: self.getAttribute('userId'),
                        events: {
                            onLoad: resolve
                        }
                    }).inject(self.getContent());
                });
            });
        },

        /**
         * Opens a category panel
         *
         * @param {String} category - name of the category
         */
        $openCategory: function (category) {
            var self = this;

            this.Loader.show();
            this.$categoryUnload();

            this.$hideCategory().then(function () {
                if (category === 'information') {
                    return self.$openInformation();
                }

                if (category === 'addresses') {
                    return self.$openAddressManagement();
                }

                if (category === 'comments') {
                    return self.$openComments();
                }

                if (category === 'userInformation') {
                    return self.$openUserInformation();
                }

                if (category === 'userProperty') {
                    return self.$openUserProperty();
                }

                if (category === 'files') {
                    return self.$openFiles();
                }

                // load employee category
                return new Promise(function (resolve) {
                    QUIAjax.get('package_quiqqer_employee_ajax_backend_employee_getCategory', function (result) {
                        self.getContent().set('html', '<form>' + result + '</form>');

                        QUI.parse(self.getContent()).then(resolve);
                    }, {
                        'package': 'quiqqer/employee',
                        category : category
                    });
                });
            }).then(function () {
                return self.$showCategory();
            }).then(function () {
                self.Loader.hide();
            });
        },

        /**
         * set the form data to the user
         */
        $categoryUnload: function () {
            var Content = this.getContent(),
                Form    = Content.getElement('form');

            if (!Form) {
                return;
            }

            var data = FormUtils.getFormData(Form);
            var com  = Form.getElements('[name="address-communication"]');

            if (typeof data.id !== 'undefined') {
                delete data.id;
            }

            if (com.length) {
                data['address-communication'] = com.map(function (entry) {
                    return {
                        type: entry.get('data-type'),
                        no  : entry.get('value')
                    };
                });
            }

            this.$User.setAttributes(data);
        },

        /**
         * hide category
         *
         * @return {Promise}
         */
        $hideCategory: function () {
            var Content = this.getContent(),
                Form    = Content.getElement('form');

            if (!Form) {
                Form = Content.getFirst();
            }

            return new Promise(function (resolve) {
                if (!Form) {
                    resolve();
                    return;
                }

                Form.setStyle('position', 'relative');

                moofx(Form).animate({
                    opacity: 0,
                    top    : -50
                }, {
                    duration: 250,
                    callback: function () {
                        Content.setStyle('opacity', 0);
                        Form.destroy();
                        resolve();
                    }
                });
            });
        },

        /**
         * show category
         *
         * @return {Promise}
         */
        $showCategory: function () {
            var Content = this.getContent(),
                Form    = Content.getElement('form');

            if (!Form) {
                Form = Content.getFirst();
            }

            return new Promise(function (resolve) {
                Form.setStyle('position', 'relative');
                Form.setStyle('top', -50);
                Form.setStyle('opacity', 0);

                Content.setStyle('opacity', 1);

                moofx(Form).animate({
                    opacity: 1,
                    top    : 0
                }, {
                    duration: 250,
                    callback: resolve
                });
            });
        },

        /**
         *
         * @param Category
         */
        $onEmployeeCategoryActive: function (Category) {
            this.$openCategory(Category.getAttribute('name'));
        },

        //endregion

        //region button actions

        /**
         * event: on address edit click
         *
         * @param event
         */
        $clickEditAddress: function (event) {
            var Target = event.target;

            if (Target.nodeName !== 'BUTTON') {
                Target = Target.getParent('button');
            }

            var Select = Target.getPrevious();

            if (Select.value === '') {
                return;
            }

            this.editAddress(parseInt(Select.value));
        },

        /**
         * event: on save click
         */
        $onSaveClick: function () {
            this.Loader.show();
            this.update().then(function () {
                this.Loader.hide();
            }.bind(this));
        },

        /**
         * event: on delete click
         */
        $onDeleteClick: function () {
            var uid = this.$User.getId();

            new QUIConfirm({
                name       : 'DeleteUser',
                icon       : 'fa fa-trash-o',
                texticon   : 'fa fa-trash-o',
                title      : QUILocale.get('quiqqer/quiqqer', 'users.user.window.delete.title'),
                text       : QUILocale.get('quiqqer/quiqqer', 'users.user.window.delete.text', {
                    userid  : this.$User.getId(),
                    username: this.$User.getName()
                }),
                information: QUILocale.get('quiqqer/quiqqer', 'users.user.window.delete.information'),
                maxWidth   : 600,
                maxHeight  : 400,
                autoclose  : false,
                events     : {
                    onSubmit: function (Win) {
                        Win.Loader.show();
                        Users.deleteUsers([uid]).then(function () {
                            Win.close();
                        });
                    }
                }
            }).open();
        },

        //endregion

        //region user events

        /**
         * event on user delete
         *
         * @param {Object} Users - qui/classes/users/Manager
         * @param {Array} uids - user ids, which are deleted
         */
        $onUserDelete: function (Users, uids) {
            var uid = parseInt(this.getAttribute('userId'));

            for (var i = 0, len = uids.length; i < len; i++) {
                if (uid === parseInt(uids[i])) {
                    this.destroy();
                    break;
                }
            }
        },

        //endregion

        //region delivery

        /**
         * Toggle the delivery address
         */
        deliveryAddressToggle: function () {
            if (!shippingInstalled) {
                return;
            }

            var Checkbox = this.getContent().getElement('[name="address-delivery"]');

            if (Checkbox.checked) {
                this.deliveryAddressClose();
            } else {
                this.deliveryAddressOpen();
            }
        },

        /**
         * opens the delivery address
         */
        deliveryAddressOpen: function () {
            if (!shippingInstalled) {
                return;
            }

            var Table = this.getContent().getElement('.delivery-address-table');

            if (!Table) {
                return;
            }

            Table.getElements('tr').forEach(function (Row) {
                if (Row.getElement('input') && Row.getElement('input').name !== 'address-delivery') {
                    Row.setStyle('display', null);
                }
            });
        },

        /**
         * Close the delivery address
         */
        deliveryAddressClose: function () {
            if (!shippingInstalled) {
                return;
            }

            var Table = this.getContent().getElement('.delivery-address-table');

            if (!Table) {
                return;
            }

            Table.getElements('tr').forEach(function (Row) {
                if (Row.getElement('input') && Row.getElement('input').name !== 'address-delivery') {
                    Row.setStyle('display', 'none');
                }
            });
        }

        //endregion
    });
});
