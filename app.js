/**********************BUDGET CONTROLLER**********************/
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percetage = -1;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        pourcentage: -1
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percetage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percetage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percetage;
    };


    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;

    };

    return {

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (curr) {
                return curr.id;
            })

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            };


            //create new Idem based on type of input
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            };

            //Add item to data structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;

        },

        calculateBudget: function () {
            //1-Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //2-calculate the budgt
            data.budget = data.totals.inc - data.totals.exp;
            //3-calculate pourcentage
            if (data.totals.inc > 0) {
                data.pourcentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.pourcentage = -1;
            }
        },

        calcPercentages: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalexp: data.totals.exp,
                pourcentage: data.pourcentage
            }
        },

        test: function () {
            console.log(data);
        }
    }


})();
/**********************END OF BUDGET CONTROLLER**********************/


/**********************UI CONTROLLER**********************/
var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        pourcentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {

        deleteListItem: function (selectorID) {
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalexp, 'exp');
            if (obj.pourcentage > 0) {
                document.querySelector(DOMStrings.pourcentageLabel).textContent = obj.pourcentage + '%';
            } else {
                document.querySelector(DOMStrings.pourcentageLabel).textContent = '---';

            }

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);


            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // return inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMString: function () {
            return DOMStrings;
        },

        changeType: function () {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function (curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },
        addListItem: function (object, type) {
            var html, newHtml, element;

            //1-create html string with placeholder text
            if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description" >%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
            } else if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //2-replace placeholder text with actual data
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));

            //3-insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearInputs: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayMonth: function () {
            var now, year, month, months;

            now = new Date();

            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        }
    };

})();
/**********************END OF UI CONTROLLER**********************/



/**********************GLOBAL CONTROLLER**********************/
var controller = (function (bdgetCntrlr, UIcntrlr) {

    var setupEventListeners = function () {
        var DOM = UIcntrlr.getDOMString();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keycode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIcntrlr.changeType);
    };

    var updateBudget = function () {
        //1-calculate budget
        bdgetCntrlr.calculateBudget();
        //2- return budget
        var budget = bdgetCntrlr.getBudget();
        //3-Display budget on the UI
        UIcntrlr.displayBudget(budget);
    }

    var updatePourcentages = function () {
        //1- calculate pourcentages
        budgetController.calcPercentages();
        //2- Real pourcentages from the budget controller
        var percentages = bdgetCntrlr.getPercentages();
        //3- Update the UI with the new pourcentages
        UIcntrlr.displayPercentages(percentages);
    };


    var ctrlAddItem = function () {

        var input, newInput;
        //1-Get the Input Data on the field
        input = UIcntrlr.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2-Add the item to the budget controller
            newInput = bdgetCntrlr.addItem(input.type, input.description, input.value);

            //3-Add the item to the UI Controller
            UIcntrlr.addListItem(newInput, input.type);

            //4-clear Input
            UIcntrlr.clearInputs();

            //5-calculate and update the badget
            updateBudget();
            //6-Calculate and update pourcentages 
            updatePourcentages();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        //1-delete the item from the data structure
        budgetController.deleteItem(type, ID);
        //2-delete the item from UI
        UIcntrlr.deleteListItem(itemID);
        //3-update and show the new budget
        updateBudget();
        //4-Calculate and update pourcentages 
        updatePourcentages();
    };

    return {
        init: function () {
            console.log('App has started');
            UIcntrlr.displayMonth();
            UIcntrlr.displayBudget({
                budget: '0',
                totalInc: '0',
                totalexp: '0',
                pourcentage: '0'
            })
            setupEventListeners();
        }
    }


})(budgetController, UIController);
/**********************END OF GLOBAL CONTROLLER**********************/

controller.init(); 