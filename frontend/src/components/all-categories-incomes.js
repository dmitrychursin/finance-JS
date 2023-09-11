import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";


export class AllCategoriesIncomes {

    constructor() {
        this.incomesCategoryElement = document.getElementById('row-income-category');
        this.categories = [];

        this.balance = [];

        this.id = UrlManager.getQueryParams()['id'];


        this.init();
    }


    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;
            }
        } catch (error) {
            return console.log(error);
        }
        this.allCategoriesIncome();
        this.getBalance();
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


    allCategoriesIncome() {
        if (this.categories && this.categories.length > 0) {
            this.categories.forEach(category => {
                const that = this;
                const categoryElement = document.createElement('div');
                categoryElement.className = 'col-4 category';

                const titleElement = document.createElement('h2');
                titleElement.className = 'title-head';
                titleElement.innerText = category.title;

                const incomesEditElement = document.createElement('button');
                incomesEditElement.className = 'income-edit btn btn-primary';
                incomesEditElement.innerText = 'Редактировать';
                incomesEditElement.setAttribute('data-id', category.id);
                incomesEditElement.onclick = function () {
                    that.categoryId(this);
                }

                const incomesDeleteElement = document.createElement('button');
                incomesDeleteElement.className = 'income-delete btn btn-danger';
                incomesDeleteElement.innerText = 'Удалить';
                incomesDeleteElement.setAttribute('data-id', category.id)
                incomesDeleteElement.onclick = function () {
                    that.categoryDelete(this);
                }

                categoryElement.appendChild(titleElement);
                categoryElement.appendChild(incomesEditElement);
                categoryElement.appendChild(incomesDeleteElement);

                this.incomesCategoryElement.appendChild(categoryElement);

                const add = document.getElementById('add');
                this.incomesCategoryElement.appendChild(add);

            });
        }
    }

    categoryId(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/editing-income-category?id=' + dataId;
        }
    }

    categoryDelete(element) {
        const that = this;
        const popupIncomesYesButton = document.getElementById('popup-incomes-yes');
        const popupIncomesNoButton = document.getElementById('popup-incomes-no');
        const popupIncomesElement = document.getElementById('popup-incomes');
        const dataId = element.getAttribute('data-id');
        popupIncomesElement.style.display = 'block';

        popupIncomesYesButton.onclick = async function () {
            popupIncomesElement.style.display = 'none';
            that.deleteCategoryIncome(dataId);
            const operations = await CustomHttp.request(config.host + "/operations?period=all");
            operations.forEach(async (operation) => {
                if (operation.category === that.categories.title) {
                    await CustomHttp.request(config.host + "/operations/" + operation.id, "DELETE");
                    let newBalance = Number(that.balance.balance) - operation.amount;
                    await CustomHttp.request(config.host + "/balance", "PUT", { newBalance: newBalance });
                    Auth.setBalance(that.balance);
                }
            });
            location.reload();
        }

        popupIncomesNoButton.onclick = function () {
            popupIncomesElement.style.display = 'none';
        }
    }

    async deleteCategoryIncome(id) {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income/' + id, "DELETE");

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