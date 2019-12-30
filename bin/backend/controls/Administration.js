/**
 * @module package/quiqqer/employee/bin/backend/controls/Administration
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event employeeOpenBegin [self, userId]
 * @event onEmployeeOpen [self, userId, Panel]
 * @event onEmployeeOpenEnd [self, userId, Panel]
 * @event onListOpen [self]
 */
define('package/quiqqer/employee/bin/backend/controls/Administration', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Switch',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/windows/Prompt',
    'qui/controls/windows/Confirm',

    'package/quiqqer/employee/bin/backend/Handler',
    'controls/grid/Grid',
    'Mustache',
    'Locale',
    'Ajax',
    'Users',
    'Permissions',

    'text!package/quiqqer/employee/bin/backend/controls/Administration.html',
    'css!package/quiqqer/employee/bin/backend/controls/Administration.css'

], function (QUI, QUIControl, QUISwitch, ContextMenu, ContextMenuItem, QUIPrompt, QUIConfirm,
             EmployeeHandler, Grid, Mustache, QUILocale, QUIAjax, Users, Permissions, template) {
    "use strict";

    var lg = 'quiqqer/employee';

    return new Class({

        Extends: QUIControl,
        Type   : 'package/quiqqer/employee/bin/backend/controls/Administration',

        Binds: [
            '$onInject',
            '$onDestroy',
            '$onUserRefresh',
            '$onUserChange',
            '$editComplete',
            '$gridDblClick',
            '$gridClick',
            'refresh',
            'toggleFilter',
            'openDeleteWindow',
            'openAddWindow'
        ],

        options: {
            page       : 1,
            perPage    : 50,
            editable   : true,
            submittable: false,
            add        : true,
            employeeId : false
        },

        initialize: function (options) {
            this.parent(options);

            this.$SearchContainer = null;
            this.$SearchInput     = null;
            this.$FilterButton    = null;
            this.$employeeGroup   = null;

            this.$employeePanel = null;
            this.$GroupSwitch   = null;
            this.$GridContainer = null;
            this.$Grid          = null;

            this.addEvents({
                onInject : this.$onInject,
                onDestroy: this.$onDestroy
            });

            Users.addEvents({
                onSwitchStatus: this.$onUserChange,
                onDelete      : this.$onUserChange,
                onRefresh     : this.$onUserRefresh,
                onSave        : this.$onUserRefresh
            });
        },

        /**
         * Create the DOMNode element
         */
        create: function () {
            var self     = this,
                editable = this.getAttribute('editable');

            this.$Elm = new Element('div', {
                'class': 'quiqqer-employee-administration',
                html   : Mustache.render(template, {
                    searchPlaceholder: QUILocale.get(lg, 'panel.search.placeholder')
                })
            });

            this.$SearchContainer = this.$Elm.getElement('.quiqqer-employee-administration-search');
            this.$GridContainer   = this.$Elm.getElement('.quiqqer-employee-administration-grid');
            this.$SearchInput     = this.$Elm.getElement('[name="search"]');
            this.$SubmitButton    = this.$Elm.getElement('[name="submit"]');
            this.$FilterButton    = this.$Elm.getElement('button[name="filter"]');

            this.$SearchContainer.getElement('form').addEvent('submit', function (event) {
                event.stop();
            });

            this.$SubmitButton.addEvent('click', function () {
                self.refresh();
            });

            this.$SearchInput.addEvent('keydown', function (event) {
                if (event.key === 'enter') {
                    event.stop();
                }
            });

            this.$SearchInput.addEvent('keyup', function (event) {
                if (event.key === 'enter') {
                    self.refresh();
                }
            });

            this.$FilterButton.addEvent('click', function (event) {
                event.stop();
                self.toggleFilter();
            });

            if (!this.getAttribute('add')) {
                this.$AddButton.setStyle('display', 'none');
            }

            this.$GroupSwitch = new QUISwitch({
                events: {
                    onChange: this.refresh
                },
                status: true,
                styles: {
                    'float'  : 'right',
                    marginTop: 5
                },
                title : QUILocale.get(lg, 'panel.search.switch.employee.group')
            }).inject(this.$SearchContainer);

            // create grid
            this.$Container = new Element('div');
            this.$Container.inject(this.$GridContainer);

            var columnModel = [];

            if (this.getAttribute('submittable')) {
                columnModel.push({
                    header   : '&nbsp',
                    dataIndex: 'submit_button',
                    dataType : 'node',
                    width    : 60
                });
            }

            columnModel.push({
                header   : QUILocale.get(lg, 'employeeId'),
                dataIndex: 'id',
                dataType : 'integer',
                width    : 100
            });

            /*{
                header   : QUILocale.get('quiqqer/quiqqer', 'username'),
                dataIndex: 'username',
                dataType : 'integer',
                width    : 150,
                editable : editable,
                className: editable ? 'clickable' : ''
            }*/

            columnModel.push({
                header   : QUILocale.get('quiqqer/quiqqer', 'firstname'),
                dataIndex: 'firstname',
                dataType : 'string',
                width    : 150,
                editable : editable,
                className: editable ? 'clickable' : ''
            });

            columnModel.push({
                header   : QUILocale.get('quiqqer/quiqqer', 'lastname'),
                dataIndex: 'lastname',
                dataType : 'string',
                width    : 150,
                editable : editable,
                className: editable ? 'clickable' : ''
            });

            columnModel.push({
                header   : QUILocale.get('quiqqer/quiqqer', 'email'),
                dataIndex: 'email',
                dataType : 'string',
                width    : 150,
                editable : editable,
                className: editable ? 'clickable' : ''
            });

            columnModel.push({
                header   : QUILocale.get('quiqqer/quiqqer', 'group'),
                dataIndex: 'usergroup_display',
                dataType : 'string',
                width    : 150,
                className: editable ? 'clickable' : ''
            });

            columnModel.push({
                dataIndex: 'usergroup',
                dataType : 'string',
                hidden   : true
            });

            columnModel.push({
                header   : QUILocale.get('quiqqer/quiqqer', 'c_date'),
                dataIndex: 'regdate',
                dataType : 'date',
                width    : 150
            });

            this.$Grid = new Grid(this.$Container, {
                buttons: [{
                    name     : 'add',
                    textimage: 'fa fa-plus',
                    text     : QUILocale.get(lg, 'window.employee.creation.title'),
                    events   : {
                        onClick: self.openAddWindow
                    }
                }, {
                    name     : 'delete',
                    textimage: 'fa fa-trash',
                    text     : QUILocale.get(lg, 'employee.window.delete.title'),
                    disabled : true,
                    styles   : {
                        'float': 'right'
                    },
                    events   : {
                        onClick: self.openDeleteWindow
                    }
                }],

                columnModel      : columnModel,
                pagination       : true,
                filterInput      : true,
                perPage          : this.getAttribute('perPage'),
                page             : this.getAttribute('page'),
                sortOn           : this.getAttribute('field'),
                serverSort       : true,
                showHeader       : true,
                sortHeader       : true,
                alternaterows    : true,
                resizeColumns    : true,
                selectable       : true,
                multipleSelection: true,
                resizeHeaderOnly : true,
                editable         : true,
                editondblclick   : true
            });

            // Events
            this.$Grid.addEvents({
                onClick     : this.$gridClick,
                onDblClick  : this.$gridDblClick,
                // onBlur    : this.$gridBlur,
                editComplete: this.$editComplete,
                refresh     : this.refresh
            });

            return this.$Elm;
        },

        /**
         * event: on inject
         */
        $onInject: function () {
            var self = this;

            this.$Grid.disable();

            if (this.getAttribute('employeeId')) {
                this.$openEmployee(this.getAttribute('employeeId'));
            }

            EmployeeHandler.getEmployeeGroupId().then(function (employeeGroup) {
                self.$employeeGroup = employeeGroup;
                self.refresh().then(function () {
                    self.$Grid.enable();
                });
            });
        },

        /**
         * Is the administration in a qui window?
         *
         * @return {boolean}
         */
        isInWindow: function () {
            return !!this.getElm().getParent('.qui-window-popup');
        },

        /**
         * event: on user change
         */
        $onUserRefresh: function () {
            this.refresh();
        },

        /**
         * event: on user status change
         *
         * @param Users
         * @param ids
         */
        $onUserChange: function (Users, ids) {
            var i, len;
            var data = this.$Grid.getData();

            if (typeOf(ids) === 'array') {
                var tmp = {};

                for (i = 0, len = ids.length; i < len; i++) {
                    tmp[ids[i]] = true;
                }

                ids = tmp;
            }

            for (i = 0, len = data.length; i < len; i++) {
                if (typeof ids[data[i].id] === 'undefined') {
                    continue;
                }

                // use is in list, refresh
                this.refresh();
                break;
            }
        },

        /**
         * event: on control destroy
         */
        $onDestroy: function () {
            Users.removeEvents({
                onSwitchStatus: this.$onUserChange,
                onDelete      : this.$onUserChange,
                onRefresh     : this.$onUserRefresh,
                onSave        : this.$onUserRefresh
            });
        },

        /**
         * return all selected employee ids
         *
         * @return {Array}
         */
        getSelectedEmployeeIds: function () {
            if (this.$EmployeePanel) {
                return [this.$EmployeePanel.getAttribute('userId')];
            }

            return this.$Grid.getSelectedData().map(function (entry) {
                return parseInt(entry.id);
            });
        },

        /**
         * return all selected employee
         *
         * @return {Array}
         */
        getSelectedEmployee: function () {
            return this.$Grid.getSelectedData();
        },

        /**
         * Resize the grid
         *
         * @return {Promise|Promise|Promise|Promise|*}
         */
        resize: function () {
            if (!this.$Grid) {
                return Promise.resolve();
            }

            var size = this.$GridContainer.getSize();

            return Promise.all([
                this.$Grid.setHeight(size.y - 40),
                this.$Grid.setWidth(size.x - 40)
            ]);
        },

        /**
         * Refresh the grid
         */
        refresh: function () {
            var self          = this,
                employeeGroup = this.$GroupSwitch.getStatus(),
                options       = this.$Grid.options,
                Form          = this.$SearchContainer.getElement('form');

            var params = {
                perPage      : options.perPage || 50,
                page         : options.page || 1,
                sortBy       : options.sortBy,
                sortOn       : options.sortOn,
                employeeGroup: employeeGroup,
                search       : this.$SearchInput.value,
                onlyEmployee : this.$GroupSwitch.getStatus() ? 1 : 0,
                filter       : {
                    userId      : Form.elements.userId.checked ? 1 : 0,
                    username    : Form.elements.username.checked ? 1 : 0,
                    firstname   : Form.elements.firstname.checked ? 1 : 0,
                    lastname    : Form.elements.lastname.checked ? 1 : 0,
                    email       : Form.elements.email.checked ? 1 : 0,
                    group       : Form.elements.group.checked ? 1 : 0,
                    regdate_from: Form.elements['registration-from'].value,
                    regdate_to  : Form.elements['registration-to'].value
                }
            };

            this.fireEvent('refreshBegin', [this]);

            return new Promise(function (resolve) {
                QUIAjax.get('package_quiqqer_employee_ajax_backend_search', function (result) {
                    var onChange = function (Switch) {
                        var userStatus = Switch.getStatus();
                        var userId     = Switch.getAttribute('userId');

                        self.$setStatus(userId, userStatus).catch(function () {
                            if (userStatus) {
                                Switch.setSilentOff();
                            } else {
                                Switch.setSilentOn();
                            }
                        });
                    };

                    var click = function () {
                        (function () {
                            self.fireEvent('submit', [self]);
                        }).delay(200);
                    };

                    for (var i = 0, len = result.data.length; i < len; i++) {
                        result.data[i].status = new QUISwitch({
                            status: result.data[i].status,
                            userId: result.data[i].id,
                            events: {
                                onChange: onChange
                            }
                        });

                        if (self.getAttribute('submittable')) {
                            result.data[i].submit_button = new Element('span', {
                                'class': 'fa fa-share',
                                title  : QUILocale.get(lg, 'window.employee.select.button'),
                                events : {
                                    click: click
                                },
                                styles : {
                                    cursor   : 'pointer',
                                    textAlign: 'center',
                                    width    : 50
                                }
                            });
                        }
                    }

                    self.$Grid.setData(result);
                    self.fireEvent('refreshEnd', [self]);
                    resolve();
                }, {
                    package: 'quiqqer/employee',
                    params : JSON.encode(params)
                });
            });
        },

        /**
         * event: grid edit complete
         *
         * @param data
         */
        $editComplete: function (data) {
            var self       = this,
                rowData    = this.$Grid.getDataByRow(data.row),
                attributes = {},
                attribute  = data.columnModel.dataIndex;

            switch (attribute) {
                case 'firstname':
                case 'lastname':
                case 'email':
                case 'username':
                    attributes[attribute] = data.input.value;
                    break;
            }

            this.$Grid.disable();

            return new Promise(function (resolve) {
                QUIAjax.post('package_quiqqer_employee_ajax_backend_employee_instantSave', function () {
                    self.$Grid.enable();
                    resolve();
                }, {
                    'package': 'quiqqer/employee',
                    userId   : rowData.id,
                    data     : JSON.encode(attributes),
                    onError  : function () {
                        rowData[attribute] = data.oldvalue;
                        self.$Grid.setDataByRow(data.row, rowData);
                        self.$Grid.enable();
                    }
                });
            });
        },

        /**
         * Set user active status
         *
         * @param userId
         * @param status
         * @return {Promise}
         */
        $setStatus: function (userId, status) {
            var self = this;

            this.$Grid.disable();

            return new Promise(function (resolve, reject) {
                QUIAjax.post('ajax_users_save', function () {
                    self.$Grid.enable();
                    resolve();
                }, {
                    uid       : userId,
                    attributes: JSON.encode({
                        active: status
                    }),
                    onError   : function (err) {
                        self.$Grid.enable();
                        reject(err);
                    }
                });
            });
        },

        /**
         * add the user to the employee group
         *
         * @param userId
         */
        $addToEmployee: function (userId) {
            this.$Grid.disable();

            EmployeeHandler.addToEmployee(userId).then(function () {
                this.refresh();
                this.$Grid.enable();
            }.bind(this));
        },

        /**
         * remove the user to the employee group
         *
         * @param userId
         */
        $removeFromEmployee: function (userId) {
            this.$Grid.disable();

            EmployeeHandler.removeFromEmployee(userId).then(function () {
                this.refresh();
                this.$Grid.enable();
            }.bind(this));
        },

        /**
         * opens the user group edit window
         *
         * @param userId
         */
        $editUserGroups: function (userId) {
            var self = this;

            require([
                'package/quiqqer/employee/bin/backend/controls/users/UserGroupsWindow'
            ], function (Window) {
                new Window({
                    userId: userId,
                    events: {
                        onSubmit: self.refresh
                    }
                }).open();
            });
        },

        /**
         * Opens the employee
         *
         * @param userId
         */
        $openEmployee: function (userId) {
            if (!userId) {
                return;
            }

            var self = this;

            this.fireEvent('employeeOpenBegin', [this, userId]);

            require([
                'package/quiqqer/employee/bin/backend/controls/employee/Panel',
                'utils/Panels'
            ], function (Panel, PanelUtils) {
                if (self.isInWindow()) {
                    var Container = new Element('div', {
                        'class': 'quiqqer-employee-administration-employee',
                        styles : {
                            left   : -50,
                            opacity: 0
                        }
                    }).inject(self.getElm());

                    self.$EmployeePanel = new Panel({
                        header          : false,
                        userId          : userId,
                        showUserButton  : true,
                        showDeleteButton: false
                    }).inject(Container);

                    self.fireEvent('employeeOpen', [this, userId, self.$EmployeePanel]);

                    moofx(Container).animate({
                        left   : 0,
                        opacity: 1
                    }, {
                        callback: function () {
                            self.$EmployeePanel.fireEvent('show');
                            self.fireEvent('employeeOpenEnd', [this, userId, self.$EmployeePanel]);
                        }
                    });

                    return;
                }

                PanelUtils.openPanelInTasks(
                    new Panel({
                        userId: userId
                    })
                );
            });
        },

        /**
         * Close the employee panel, if a employee panel exist
         */
        closeEmployee: function () {
            if (!this.$EmployeePanel) {
                return;
            }

            var self      = this,
                Container = this.$EmployeePanel.getElm().getParent();

            moofx(Container).animate({
                left   : 50,
                opacity: 0
            }, {
                callback: function () {
                    self.$EmployeePanel = null;
                    Container.destroy();
                }
            });
        },

        /**
         * event: on dbl click at grid
         *
         * @param {object} data - cell data
         */
        $gridDblClick: function (data) {
            if (typeof data === 'undefined' && typeof data.cell === 'undefined') {
                return;
            }

            var rowData = this.$Grid.getDataByRow(data.row);

            if (data.cell.get('data-index') === 'employeeId' || data.cell.get('data-index') === 'regdate') {
                this.$openEmployee(rowData.id);
                return;
            }

            if (this.getAttribute('editable') === false &&
                (data.cell.get('data-index') === 'firstname' ||
                    data.cell.get('data-index') === 'lastname' ||
                    data.cell.get('data-index') === 'usergroup_display' ||
                    data.cell.get('data-index') === 'email')) {
                this.$openEmployee(rowData.id);
                return;
            }


            if (data.cell.get('data-index') === 'usergroup_display') {
                var self     = this,
                    Cell     = data.cell,
                    position = Cell.getPosition();

                var Menu = new ContextMenu({
                    events: {
                        onBlur: function () {
                            Menu.hide();
                            Menu.destroy();
                        }
                    }
                });

                if (rowData.usergroup.indexOf(this.$employeeGroup) === -1) {
                    Menu.appendChild(
                        new ContextMenuItem({
                            icon  : 'fa fa-user-o',
                            text  : QUILocale.get(lg, 'administration.contextMenu.add.to.employee'),
                            events: {
                                onClick: function () {
                                    self.$addToEmployee(rowData.id);
                                }
                            }
                        })
                    );
                } else {
                    Menu.appendChild(
                        new ContextMenuItem({
                            icon  : 'fa fa-user-o',
                            text  : QUILocale.get(lg, 'administration.contextMenu.remove.from.employee'),
                            events: {
                                onClick: function () {
                                    self.$removeFromEmployee(rowData.id);
                                }
                            }
                        })
                    );
                }

                Menu.appendChild(
                    new ContextMenuItem({
                        icon  : 'fa fa-users',
                        text  : QUILocale.get(lg, 'administration.contextMenu.groups'),
                        events: {
                            onClick: function () {
                                self.$editUserGroups(rowData.id);
                            }
                        }
                    })
                );

                Menu.appendChild(
                    new ContextMenuItem({
                        icon  : 'fa fa-user',
                        text  : QUILocale.get(lg, 'administration.contextMenu.user'),
                        events: {
                            onClick: function () {
                                self.$openEmployee(rowData.id);
                            }
                        }
                    })
                );

                Menu.inject(document.body);
                Menu.setPosition(position.x, position.y + 30);
                Menu.setTitle(rowData.id);
                Menu.show();
                Menu.focus();
            }
        },

        /**
         * event: on grid click
         */
        $gridClick: function () {
            var selected = this.$Grid.getSelectedData();
            var Delete   = this.$Grid.getButtons().filter(function (Btn) {
                return Btn.getAttribute('name') === 'delete';
            })[0];

            Delete.disable();

            if (selected.length === 1) {
                Delete.enable();
            }
        },

        /**
         * opens the add employee window
         */
        openAddWindow: function () {
            var self = this;

            require([
                'package/quiqqer/employee/bin/backend/controls/create/EmployeeWindow'
            ], function (EmployeeWindow) {
                new EmployeeWindow({
                    events: {
                        onSubmit: function (Instance, employeeId) {
                            self.refresh();
                            self.$openEmployee(employeeId);
                        }
                    }
                }).open();
            });
        },

        /**
         * opens the employee delete window
         */
        openDeleteWindow: function () {
            var self = this;

            new QUIConfirm({
                title      : QUILocale.get(lg, 'employee.window.delete.title'),
                text       : QUILocale.get(lg, 'employee.window.delete.text'),
                information: QUILocale.get(lg, 'employee.window.delete.information'),
                icon       : 'fa fa-trash',
                texticon   : 'fa fa-trash',
                maxHeight  : 400,
                maxWidth   : 600,
                autoclose  : false,
                events     : {
                    onSubmit: function (Win) {
                        Win.Loader.show();

                        var selected = self.$Grid.getSelectedData().map(function (entry) {
                            return entry.id;
                        });

                        Users.deleteUsers(selected).then(function () {
                            Win.close();
                            self.refresh();
                        });
                    }
                }
            }).open();
        },

        //region filter

        /**
         * Toggle the filter
         */
        toggleFilter: function () {
            var FilterContainer = this.getElm().getElement('.quiqqer-employee-administration-search-filter');

            if (FilterContainer.getStyle('display') === 'none') {
                this.openFilter();
            } else {
                this.closeFilter();
            }
        },

        /**
         * Open the filter
         */
        openFilter: function () {
            var self            = this,
                FilterContainer = this.getElm().getElement('.quiqqer-employee-administration-search-filter');

            FilterContainer.setStyle('position', 'absolute');
            FilterContainer.setStyle('opacity', 0);
            FilterContainer.setStyle('overflow', 'hidden');

            // reset
            FilterContainer.setStyle('display', null);
            FilterContainer.setStyle('height', null);
            FilterContainer.setStyle('paddingBottom', null);
            FilterContainer.setStyle('paddingTop', null);

            var height = FilterContainer.getSize().y;

            FilterContainer.setStyle('height', 0);
            FilterContainer.setStyle('paddingBottom', 0);
            FilterContainer.setStyle('paddingTop', 0);
            FilterContainer.setStyle('position', null);

            moofx(FilterContainer).animate({
                height       : height,
                marginTop    : 20,
                opacity      : 1,
                paddingBottom: 10,
                paddingTop   : 10
            }, {
                duration: 300,
                callback: function () {
                    self.resize();
                }
            });
        },

        /**
         * Close the filter
         */
        closeFilter: function () {
            var self            = this,
                FilterContainer = this.getElm().getElement('.quiqqer-employee-administration-search-filter');

            moofx(FilterContainer).animate({
                height       : 0,
                marginTop    : 0,
                opacity      : 1,
                paddingBottom: 0,
                paddingTop   : 0
            }, {
                duration: 300,
                callback: function () {
                    FilterContainer.setStyle('display', 'none');

                    FilterContainer.setStyle('height', null);
                    FilterContainer.setStyle('paddingBottom', null);
                    FilterContainer.setStyle('paddingTop', null);

                    self.resize();
                }
            });
        }

        //endregion
    });
});
