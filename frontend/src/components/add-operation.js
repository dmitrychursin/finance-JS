import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";


export class AddOperation {

    constructor() {

        this.expenses = [];
        this.incomes = [];

        this.addExpenseInputCategoryElement = document.getElementById('select-category');
        this.selectCategoryIncomeExpense = document.getElementById('select-category-income-expense');

        this.addIncomeExpenseSaveElement = document.getElementById('add-income-expense-save');
        this.addIncomeExpenseCancelElement = document.getElementById('add-income-expense-cancel');
        this.id = UrlManager.getQueryParams()['id'];

        this.addIncomeExpenseCancelElement.onclick = function () {
            location.href = '#/income-and-expenses';
        }

        const that = this
        this.addIncomeExpenseSaveElement.onclick = function () {
            that.setOperation();
            that.setBalance();
            location.href = '#/income-and-expenses';
        }

        this.addIncomeExpenseInputNumberElement = document.getElementById('input-number');
        this.addIncomeExpenseInputDateElement = document.getElementById('input-date');

        this.addIncomeExpenseInputTextElement = document.getElementById('input-text');
        this.addIncomeExpenseInputTextElement.value = "-";

        this.newBalance = null;
        this.balance = [];

        this.init();
        this.getBalance()
    }

    async getBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.balance = result
            }
        } catch (error) {
            return console.log(error);
        }
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.incomes = result;
            }
        } catch (error) {
            return console.log(error);
        }

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.expenses = result;
                this.getCategories();
            }
        } catch (error) {
            return console.log(error);
        }
    }

    getCategories() {
        const that = this
        const selectCategoryIncomeExpense = document.getElementById('select-category-income-expense');

        selectCategoryIncomeExpense.onchange = function () {
            that.deleteSelectCategory();
            const value = selectCategoryIncomeExpense.options[selectCategoryIncomeExpense.selectedIndex].value;
            if (value === 'income') {
                that.getCategoriesIncome();
                this.addIncomeExpenseInputNumberElement = document.getElementById('input-number');
                this.addIncomeExpenseInputNumberElement.onchange = function () {
                    that.newBalance = that.balance.balance + parseInt(that.addIncomeExpenseInputNumberElement.value)
                    console.log(that.newBalance)
                }
            }
            if (value === 'expense') {
                that.getCategoriesExpense();
                this.addIncomeExpenseInputNumberElement = document.getElementById('input-number');
                this.addIncomeExpenseInputNumberElement.onchange = function () {
                    that.newBalance = that.balance.balance - parseInt(that.addIncomeExpenseInputNumberElement.value)
                    console.log(that.newBalance)
                }
            }
        }
    }


    deleteSelectCategory() {
        let options = document.querySelectorAll('#select-category option');
        options.forEach(o => o.remove());
    }


    getCategoriesExpense() {
        if (this.expenses && this.expenses.length > 0) {
            this.expenses.forEach(category => {
                const addExpenseInputCategoryElement = document.getElementById('select-category');
                const option = document.createElement("option");

                option.value = category.id;
                option.text = category.title;

                addExpenseInputCategoryElement.appendChild(option);
            })
        }
    }


    getCategoriesIncome() {
        if (this.incomes && this.incomes.length > 0) {
            this.incomes.forEach(income => {
                const addExpenseInputCategoryElement = document.getElementById('select-category');
                const option = document.createElement("option");

                option.value = income.id;
                option.text = income.title;

                addExpenseInputCategoryElement.appendChild(option);
            })
        }
    }

    async setOperation() {
        try {
            const result = await CustomHttp.request(config.host + '/operations', 'POST', {
                type: this.selectCategoryIncomeExpense.options[this.selectCategoryIncomeExpense.selectedIndex].value,
                category_id: parseInt(this.addExpenseInputCategoryElement.options[this.addExpenseInputCategoryElement.selectedIndex].value),
                amount: parseInt(this.addIncomeExpenseInputNumberElement.value),
                date: this.addIncomeExpenseInputDateElement.value,
                comment: this.addIncomeExpenseInputTextElement.value,
            });
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            return console.log(error);
        }
    }

    async setBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance', 'PUT', {
                newBalance: this.newBalance
            });
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                Auth.setBalance(result.balance);
            }
        } catch (error) {
            return console.log(error);
        }
    }

}

