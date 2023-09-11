import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class AddCategoryExpense {

    constructor() {
        this.saveAddButtonElement = document.getElementById('add-save');
        this.cancelAddButtonElement = document.getElementById('add-cancel');
        this.inputAddExpenseElement = document.getElementById('input-add-expense');

        this.id = UrlManager.getQueryParams()['id'];

        this.cancelAddButtonElement.onclick = function () {
            location.href = '#/expenses';
        }

        const that = this
        this.saveAddButtonElement.onclick = function () {
            that.init();
            location.href = '#/expenses';
        }
    }

    async init() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/expense', "POST", {
                title: this.inputAddExpenseElement.value
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
