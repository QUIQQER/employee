/**
 * @module package/quiqqer/employee/bin/backend/controls/employee/SelectItem
 * @author www.pcsg.de (Henning Leutz)
 */
define('package/quiqqer/employee/bin/backend/controls/employee/SelectItem', [

    'qui/QUI',
    'qui/controls/elements/SelectItem',
    'Ajax',
    'Users'

], function (QUI, QUIElementSelectItem, QUIAjax, Users) {
    "use strict";

    return new Class({

        Extends: QUIElementSelectItem,
        Type   : 'package/quiqqer/employee/bin/backend/controls/employee/SelectItem',

        Binds: [
            'refresh'
        ],

        initialize: function (options) {
            this.parent(options);
            this.setAttribute('icon', 'fa fa-user-o');
        },

        /**
         * Refresh the display
         *
         * @returns {Promise}
         */
        refresh: function () {
            var id   = this.getAttribute('id'),
                Prom = Promise.resolve();

            // user
            this.setAttribute('icon', 'fa fa-user-o');

            var isnum = /^\d+$/.test(id);

            if (!isnum) {
                this.destroy();

                return Prom;
            }

            var User = Users.get(parseInt(id));

            if (!User.isLoaded()) {
                Prom = User.load();
            }

            return Prom.then(function () {
                this.$Text.set({
                    html: User.getName()
                });
            }.bind(this)).catch(function (err) {
                console.error(err);

                this.destroy();
            }.bind(this));
        }
    });
});
