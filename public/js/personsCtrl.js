var app = angular.module('paionline')

app.controller('PersonsCtrl', [ '$http', 'routes', 'common', function($http, routes, common) {
    console.log('Kontroler PersonCtrl startuje')
    var ctrl = this

    ctrl.visible = function() {
        var route = routes.find(function(el) { return el.route == '/persons' })
        return route && route.roles.includes(common.sessionData.role)
    }
    if(!ctrl.visible()) return

    /* window scroll event */
    angular.element(window).bind('scroll', function(){
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight + 69)) {
            console.log("bottom");
            if (ctrl.hideNavBar === true) ctrl.searchPersons();
        }
    })

    ctrl.selected = -1

    /* For paging results */
    ctrl.pages = []
    ctrl.displayRecordsCount = 10;
    ctrl.allPersonRecords = 0;
    ctrl.page = 0;
    /* For paging results */

    /* For search results */
    ctrl.searchPhraze = "";
    ctrl.loadedPersons = 0; // use to skip records inside database
    ctrl.hideNavBar = false;
    /* For search results */

    ctrl.persons = []
    ctrl.history = []

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        year: 1970
    }

    var getAvailabelSpace = function() {
        return Math.round(window.innerHeight / 37); // max availabale persons on page, 37 - height of the row
    };

    ctrl.onSearchPersonsButtonClicked = function() {
        ctrl.loadedPersons = 0;
        ctrl.searchPersons();
    }

    ctrl.searchPersons = function() {
        if (ctrl.loadedPersons === 0){
            ctrl.persons = [];
        }
        if (ctrl.searchPhraze.replace(' ','') !== ""){
            ctrl.hideNavBar = true;
            let available = getAvailabelSpace() - ctrl.loadedPersons;
            $http.get('/person?phraze=' + ctrl.searchPhraze + '&skip=' + ctrl.loadedPersons + '&limit=' + ( (available < 0) ? 5 : available)).then(
                function(res) {
                    Array.prototype.push.apply(ctrl.persons,res.data);
                    ctrl.loadedPersons = ctrl.persons.length;
                },
                function(err) {}
            )
        }
        else {
            ctrl.hideNavBar = false;
            ctrl.loadedPersons = 0;
            refreshPersons();
        }
    }

    ctrl.selectPage = function(pagenumber) {
        ctrl.page = pagenumber;
        refreshPersons();
        ctrl.selected = -1
    }

    ctrl.onPreviousButtonClicked = function() {
        // page--
        if (ctrl.page > 0) {
            ctrl.page -= 1;
            refreshPersons();
        }
        else return;
        ctrl.selected = -1
    }

    ctrl.onNextButtonClicked = function() {
        // page++
        if (ctrl.page < ctrl.pages.length) {
            ctrl.page += 1;
            refreshPersons();
        }
        else return;
        ctrl.selected = -1
    }

    ctrl.changeDisplayRecordsCount = function() {
        refreshPersons();
    }

    var refreshPersons = function() {
        $http.get('/person?page=' + ctrl.page + '&recordsCount=' + ctrl.displayRecordsCount).then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
        $http.get('/personsCount').then(
            function(res) {
                ctrl.pages = []
                ctrl.allPersonRecords = res.data;
                let maxPage = ctrl.allPersonRecords / ctrl.displayRecordsCount
                for (let i = 0; i < maxPage; i++) {
                    ctrl.pages[i] = i;
                }
                if (ctrl.page > maxPage) {
                    ctrl.selectPage(ctrl.pages[ctrl.pages.length - 1]);
                }
            },
            function (err) {}
        )
    }

    var refreshPerson = function() {
        $http.get('/person?_id=' + ctrl.persons[ctrl.selected]._id).then(
            function(res) {
                ctrl.person = res.data
            },
            function(err) {}
        )
    }

    refreshPersons();

    ctrl.insertNewData = function() {
        $http.post('/person', ctrl.newPerson).then(
            function(res) {
                refreshPersons()
            },
            function(err) {}
        )
    }

    ctrl.select = function(index) {
        ctrl.selected = index
        refreshPerson()
    }

    ctrl.updateData = function() {
        $http.put('/person?_id=' + ctrl.persons[ctrl.selected]._id, ctrl.person).then(
            function(res) {
                refreshPersons();
            },
            function(err) {}
        )
    }

    ctrl.deleteData = function() {
        $http.delete('/person?_id=' + ctrl.persons[ctrl.selected]._id).then(
            function(res) {
                refreshPersons();
            },
            function(err) {}
        )
    }

}])