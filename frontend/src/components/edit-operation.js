import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth";

export class EditOperation {

    constructor() {
        const that = this
        this.id = UrlManager.getQueryParams()['id'];

        this.incomes = [];
        this.expenses = [];
        this.editOperations = [];

        this.balance = [];

        this.editIncomeExpenseSaveElement = document.getElementById('edit-income-expense-save');
        this.editIncomeExpenseCancelElement = document.getElementById('edit-income-expense-cancel');

        this.editIncomeExpense = document.getElementById('edit-income-expense');

        this.editExpenseInputCategoryElement = document.getElementById('select-category');
        this.selectCategoryIncomeExpense = document.getElementById('select-category-income-expense');

        this.inputNumberElement = document.getElementById('input-number');
        this.inputDateElement = document.getElementById('input-date');
        this.inputTextElement = document.getElementById('input-text');

        this.editIncomeExpenseCancelElement.onclick = function () {
            location.href = '#/income-and-expenses';
        }


        this.editIncomeExpenseSaveElement.onclick = function () {
            that.editOperationsPut();
            that.setBalance();
            location.href = '#/income-and-expenses';
        }

        this.getCategoriesAll();
        this.getBalance();
        this.init();
    }


    async init() {

        try {
            const result = await CustomHttp.request(config.host + '/operations/' + this.id);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.editOperations = result
            }
        } catch (error) {
            return console.log(error);
        }
        this.getOperationsCategories();
        this.getOperationValue();
    }


    async getCategoriesAll() {
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
            }
        } catch (error) {
            return console.log(error);
        }
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
        console.log(this.balance)
    }

    getOperationsCategories() {
        const that = this
        const selectCategoryIncomeExpense = document.getElementById('select-category-income-expense');
        selectCategoryIncomeExpense.onchange = function () {
            that.deleteSelectCategory()
            const value = selectCategoryIncomeExpense.options[selectCategoryIncomeExpense.selectedIndex].value;
            if (value === 'income') {
                that.getCategoriesIncome();
                this.inputNumberElement = document.getElementById('input-number');
                this.inputNumberElement.onclick = function () {
                    that.newBalance = (that.balance.balance - that.editOperations.amount) + parseInt(that.inputNumberElement.value)
                    console.log(that.newBalance)
                }
            } else if (value === 'expense') {
                that.getCategoriesExpense();
                this.inputNumberElement = document.getElementById('input-number');
                this.inputNumberElement.onclick = function () {
                    that.newBalance = (that.balance.balance + that.editOperations.amount) - parseInt(that.inputNumberElement.value)
                    console.log(that.newBalance)
                }
            }
        }
    }

    deleteSelectCategory() {
        let options = document.querySelectorAll('#select-category option');
        options.forEach(o => o.remove());
    }

    getOperationValue() {
        if (this.editOperations) {
            const selectCategoryIncomeExpense = document.getElementById('select-category-income-expense');
            selectCategoryIncomeExpense.value = this.editOperations.type;
            const optionType = document.createElement("option");

            optionType.value = this.editOperations.type;
            optionType.text = this.editOperations.type;

            const addExpenseCategoryElement = document.getElementById('select-category');
            addExpenseCategoryElement.value = this.editOperations.category;
            const option = document.createElement("option");

            option.value = this.editOperations.category;
            option.text = this.editOperations.category;

            addExpenseCategoryElement.appendChild(option);

            const inputNumberElement = document.getElementById('input-number');
            inputNumberElement.value = this.editOperations.amount

            const inputDateElement = document.getElementById('input-date');
            inputDateElement.value = this.editOperations.date

            const inputTextElement = document.getElementById('input-text');
            inputTextElement.value = this.editOperations.comment

        }
    }

    getCategoriesExpense() {
        if (this.expenses && this.expenses.length > 0) {
            this.expenses.forEach(category => {
                const addExpenseCategoryElement = document.getElementById('select-category');
                const option = document.createElement("option");
                option.value = category.id;
                option.text = category.title;
                addExpenseCategoryElement.appendChild(option);
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

    async editOperationsPut() {
        try {
            const result = await CustomHttp.request(config.host + '/operations/' + this.id, 'PUT', {
                type: this.selectCategoryIncomeExpense.options[this.selectCategoryIncomeExpense.selectedIndex].value,
                amount: parseInt(this.inputNumberElement.value),
                date: this.inputDateElement.value,
                comment: this.inputTextElement.value,
                category_id: parseInt(this.editExpenseInputCategoryElement.options[this.editExpenseInputCategoryElement.selectedIndex].value)
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
                location.reload();
            }
        } catch (error) {
            return console.log(error);
        }
    }

}


