/**
 * @module package/quiqqer/employee/bin/backend/classes/Handler
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/classes/Handler', [

    'qui/QUI',
    'qui/classes/DOM',
    'Ajax'

], function (QUI, QDOM, QUIAjax) {
    "use strict";

    return new Class({

        Extends: QDOM,
        Type   : 'package/quiqqer/employee/bin/backend/classes/Handler',

        initialize: function (parent) {
            this.parent(parent);
        },

        /**
         *
         * @return {Promise}
         */
        getEmployeeGroupId: function () {
            return new Promise(function (resolve) {
                QUIAjax.post('package_quiqqer_employee_ajax_backend_getEmployeeGroupId', resolve, {
                    'package': 'quiqqer/employee'
                });
            });
        },

        /**
         * add user to employee group
         *
         * @param userId
         * @return {Promise}
         */
        addToEmployee: function (userId) {
            return new Promise(function (resolve) {
                QUIAjax.post('package_quiqqer_employee_ajax_backend_addToEmployee', resolve, {
                    'package': 'quiqqer/employee',
                    userId   : userId
                });
            });
        },

        /**
         * remove user from employee group
         *
         * @param userId
         * @return {Promise}
         */
        removeFromEmployee: function (userId) {
            return new Promise(function (resolve) {
                QUIAjax.post('package_quiqqer_employee_ajax_backend_removeFromEmployee', resolve, {
                    'package': 'quiqqer/employee',
                    userId   : userId
                });
            });
        },

        /**
         * Opens the employee panel
         *
         * @param userId
         */
        openEmployee: function (userId) {
            return new Promise(function (resolve) {
                require([
                    'package/quiqqer/employee/bin/backend/controls/employee/Panel',
                    'utils/Panels'
                ], function (Panel, PanelUtils) {
                    var EmployeePanel = new Panel({
                        userId: userId
                    });

                    PanelUtils.openPanelInTasks(EmployeePanel);
                    resolve(EmployeePanel);
                });
            });
        }
    });
});
