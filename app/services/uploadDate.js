'use strict';

angular.module('myApp')

    .service('filterDate', function () {
        /**
         *
         * @month integer - which month
         * @year integer - which year
         * @returns {Date}
         */
        function firstMonday(month, year) {
            let d = new Date(year, month, 1, 0, 0, 0, 0);
            let day = 0;
            if (d.getDay() === 0) {
                day = 2;
                d = d.setDate(day);
                d = new Date(d);
            }
            else if (d.getDay() !== 1) {
                day = 9 - (d.getDay());
                d = d.setDate(day);
                d = new Date(d);
            }
            return d
        }

        /**
         *
         * @filterType date param from state
         * @returns ISO date
         */
        this.uploadDate = (filterType) => {
            let ISODate = '';
            const newDate = new Date();
            const year = newDate.getFullYear();
            const month = newDate.getMonth();
            const lasthour = new Date(newDate.getTime() - (1000 * 60 * 60));
            const thismonth = new Date(`${year}-${month}-01`);
            const thisyear = new Date(`${year}-01-01`);
            const today = new Date(newDate.setDate(newDate.getDate()-1));

            switch (filterType) {
                case 'today':
                    ISODate = today.toISOString();
                    break;
                case 'hour':
                    ISODate = lasthour.toISOString();
                    break;
                case 'week':
                    ISODate = firstMonday(month, year).toISOString();
                    break;
                case 'month':
                    ISODate = thismonth.toISOString();
                    break;
                case 'year':
                    ISODate = thisyear.toISOString();
                    break;
            }
            return ISODate;
        }
    });