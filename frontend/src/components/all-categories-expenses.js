import config from "../../config/config.js";
import {CustomHttp} from "../services/custom-http.js";
import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";

export class AllCategoriesExpenses {

    constructor() {
        this.expensesCategoryElement = document.getElementById('row-expenses-category');
        this.categories = [];
        this.balance = [];

        this.id = UrlManager.getQueryParams()['id'];

        this.init();
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
        document.getElementById('money').innerText = this.balance.balance + "$";
    }

    async init() {

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;

            }
        } catch (error) {
            return console.log(error);
        }
        this.fillCategoryExpenses();
        this.getBalance();
    }


    fillCategoryExpenses() {
        if (this.categories && this.categories.length > 0) {
            this.categories.forEach(category => {
                const that = this;
                const categoryElement = document.createElement('div');
                categoryElement.className = 'col-4 category';

                const titleElement = document.createElement('h2');
                titleElement.className = 'title-head';
                titleElement.innerText = category.title;

                const expensesEditElement = document.createElement('button');
                expensesEditElement.className = 'expenses-edit btn btn-primary';
                expensesEditElement.innerText = 'Редактировать';
                expensesEditElement.setAttribute('data-id', category.id);
                expensesEditElement.onclick = function () {
                        that.categoryId(this);
                }

                const expensesDeleteElement = document.createElement('button');
                expensesDeleteElement.className = 'expenses-delete btn btn-danger';
                expensesDeleteElement.innerText = 'Удалить';
                expensesDeleteElement.setAttribute('data-id', category.id)
                expensesDeleteElement.onclick = function () {
                    that.categoryDelete(this);
                }

                categoryElement.appendChild(titleElement);
                categoryElement.appendChild(expensesEditElement);
                categoryElement.appendChild(expensesDeleteElement);

                this.expensesCategoryElement.appendChild(categoryElement);

                const add = document.getElementById('add');
                this.expensesCategoryElement.appendChild(add);

            });
        }
    }

    categoryId(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/editing-expense-category?id=' + dataId;
        }
    }

    categoryDelete(element) {
        const that = this;
        const popupExpensesYesButton = document.getElementById('popup-expenses-yes');
        const popupExpensesNoButton = document.getElementById('popup-expenses-no');
        const popupExpensesElement = document.getElementById('popup-expenses');
        const dataId = element.getAttribute('data-id');
        popupExpensesElement.style.display = 'block';
        popupExpensesYesButton.onclick = async  function () {
            popupExpensesElement.style.display = 'none';
            that.deleteCategoryExpense(dataId);
            const operations = await CustomHttp.request(config.host + "/operations?period=all");
            operations.forEach(async (operation) => {
                if (operation.category === that.categories.title) {
                    await CustomHttp.request(config.host + "/operations/" + operation.id, "DELETE");
                    let newBalance = Number(that.balance.balance) + operation.amount;
                    await CustomHttp.request(config.host + "/balance", "PUT", { newBalance: newBalance });
                    Auth.setBalance(that.balance);
                }
            });

            location.reload();
        }
        popupExpensesNoButton.onclick = function () {
            popupExpensesElement.style.display = 'none';
        }
    }





    async deleteCategoryExpense(id) {
        try {
            const result = await CustomHttp.request(config.host + '/categories/expense/' + id, "DELETE");

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

