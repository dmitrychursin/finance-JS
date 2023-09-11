import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";


export class AllOperations {
    period;

    constructor() {

        this.tbody = document.getElementById('tbody');
        this.id = UrlManager.getQueryParams()['id'];

        this.operations = [];
        this.balance = [];

        this.getOperations();
        this.initializeButtons();
    }

    async getBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.balance = result
                Auth.setBalance(result.balance);
            }
        } catch (error) {
            return console.log(error);
        }
        document.getElementById('money').innerText = this.balance.balance + "$";
    }

    async getOperations(period, dateFrom, dateTo) {
        let url = "/operations"

        if (period) {
            url += '?period=' + period;
        }

        if (period === 'interval') {
            url += '&dateFrom=' + dateFrom;
            url += '&dateTo=' + dateTo;
        }

        try {
            const result = await CustomHttp.request(config.host + url);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operations = result;
                this.getBalance();
                this.allOperations();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    initializeButtons() {
        const buttons = document.getElementsByClassName('button-date-action');
        for (let button of buttons) {
            switch (button.id) {
                case 'main-today-button':
                    button.onclick = () => {
                        this.period = '';
                        this.setActiveButton(button);
                        this.deleteTbody();
                        this.getOperations();
                    };
                    break;
                case 'main-week-button':
                    button.onclick = () => {
                        this.period = 'week';
                        this.setActiveButton(button);
                        this.deleteTbody();
                        this.getOperations(this.period)

                    };
                    break;
                case 'main-month-button':
                    button.onclick = () => {
                        this.period = 'month';
                        this.setActiveButton(button);
                        this.deleteTbody();
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-year-button':
                    button.onclick = () => {
                        this.period = 'year';
                        this.setActiveButton(button);
                        this.deleteTbody();
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-all-button':
                    button.onclick = () => {
                        this.period = 'all';
                        this.setActiveButton(button);
                        this.deleteTbody();
                        this.getOperations(this.period);
                    };
                    break;
                case 'main-interval-button':
                    button.onclick = () => {
                        this.period = 'interval'
                        this.setActiveButton(button);
                        this.deleteTbody();

                        const dateForm = document.getElementById('dateForm');
                        const dateTo = document.getElementById('dateTo');

                        if (dateForm.value && dateTo.value) {
                            this.getOperations(this.period, dateForm.value, dateTo.value);
                        }

                        dateForm.onchange = () => {
                            if (this.period === 'interval' && dateForm.value && dateTo.value) {
                                this.getOperations(this.period, dateForm.value, dateTo.value);
                            }
                        };

                        dateTo.onchange = () => {
                            if (this.period === 'interval' && dateTo.value && dateForm.value) {
                                this.getOperations(this.period, dateForm.value, dateTo.value);
                            }
                        };

                    };
                    break;
            }
        }
    }

    deleteTbody() {
        const old_tbody = document.getElementById("tbody")
        this.tbody = document.createElement('tbody');
        this.tbody.id = 'tbody'
        old_tbody.parentNode.replaceChild(this.tbody, old_tbody)
    }

    allOperations() {
        if (this.operations && this.operations.length > 0) {
            this.operations.forEach(operation => {
                const that = this;
                const operationsTrElement = document.createElement('tr');
                operationsTrElement.className = 'tr'

                const operationsNumberElement = document.createElement('th');
                operationsNumberElement.className = 'number';
                operationsNumberElement.innerText = operation.id
                operationsNumberElement.setAttribute('scope', 'row')

                const operationsTypeElement = document.createElement('td');
                operationsTypeElement.className = 'text-green type';
                operationsTypeElement.innerText = operation.type;
                if (operation.type === 'expense') {
                    operationsTypeElement.innerText = 'расход'
                    operationsTypeElement.style.color = '#DC3545';

                }
                if (operation.type === 'income') {
                    operationsTypeElement.innerText = 'доход'
                    operationsTypeElement.style.color = '#198754';
                }

                const operationsCategoryElement = document.createElement('td');
                operationsCategoryElement.className = 'category';
                operationsCategoryElement.innerText = operation.category;

                const operationsAmountElement = document.createElement('td');
                operationsAmountElement.className = 'amount';
                operationsAmountElement.innerText = operation.amount + '$';

                const operationsDateElement = document.createElement('td');
                operationsDateElement.className = 'date';
                const data = new Date(operation.date);
                operationsDateElement.innerText = data.toLocaleDateString();

                const operationsCommentElement = document.createElement('td');
                operationsCommentElement.className = 'comment';
                operationsCommentElement.innerText = operation.comment;

                const operationsIconsElement = document.createElement('td');
                operationsIconsElement.className = 'td-union-stroke';

                const operationsIconElement = document.createElement('a');
                operationsIconElement.className = 'a-union';
                operationsIconElement.style.cursor = 'pointer'
                operationsIconElement.setAttribute('data-id', operation.id)
                operationsIconElement.onclick = function () {
                    that.operationDelete(this);
                }

                const operationsImageElement = document.createElement('img');
                operationsImageElement.setAttribute('src', '/images/union.png');
                operationsImageElement.setAttribute('alt', 'Корзина');

                const operationsIconTwoElement = document.createElement('a');
                operationsIconTwoElement.className = 'a-stroke';
                operationsIconTwoElement.style.cursor = 'pointer'
                operationsIconTwoElement.setAttribute('data-id', operation.id);
                operationsIconTwoElement.onclick = function () {
                    that.operationId(this);
                }

                const operationsImageTwoElement = document.createElement('img');
                operationsImageTwoElement.setAttribute('src', '/images/stroke.png');
                operationsImageTwoElement.setAttribute('alt', 'Карандаш');

                operationsIconElement.appendChild(operationsImageElement);
                operationsIconTwoElement.appendChild(operationsImageTwoElement);
                operationsIconsElement.appendChild(operationsIconElement);
                operationsIconsElement.appendChild(operationsIconTwoElement);

                operationsTrElement.appendChild(operationsNumberElement);
                operationsTrElement.appendChild(operationsTypeElement);
                operationsTrElement.appendChild(operationsCategoryElement);
                operationsTrElement.appendChild(operationsAmountElement);
                operationsTrElement.appendChild(operationsDateElement);
                operationsTrElement.appendChild(operationsCommentElement);
                operationsTrElement.appendChild(operationsIconsElement);

                this.tbody.appendChild(operationsTrElement);
            });
        }
    }

    operationId(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/editing-income-expense?id=' + dataId;
        }
    }

    operationDelete(element) {
        const that = this;
        const popupIncomeAndExpensesYesButton = document.getElementById('popup-income-and-expenses-yes');
        const popupIncomeAndExpensesNoButton = document.getElementById('popup-income-and-expenses-no');

        const popupIncomeAndExpensesElement = document.getElementById('popup-income-and-expenses');
        const operationId = element.getAttribute('data-id');
        popupIncomeAndExpensesElement.style.display = 'block';
        popupIncomeAndExpensesYesButton.onclick = function () {
            popupIncomeAndExpensesElement.style.display = 'none';
            that.deleteOperationIncomeAndExpense(operationId);
            location.reload();
        }
        popupIncomeAndExpensesNoButton.onclick = function () {
            popupIncomeAndExpensesElement.style.display = 'none';
        }
    }

    setActiveButton(buttonElement) {
        document.querySelectorAll('.active').forEach(item => {
            item.classList.remove('active');
        });
        buttonElement.classList.add('active');
    }

    async deleteOperationIncomeAndExpense(id) {
        try {
            const result = await CustomHttp.request(config.host + '/operations/' + id, "DELETE", {
                id: this.id,
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            return console.log(error);
        }
    }
}





