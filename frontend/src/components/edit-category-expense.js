import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UrlManager} from "../utils/url-manager.js";

export class EditCategoryExpense {

    constructor() {
        this.categories = [];

        this.saveButtonElement = document.getElementById('save');
        this.cancelButtonElement = document.getElementById('cancel');
        this.inputExpenseElement = document.getElementById('input-expense');

        this.id = UrlManager.getQueryParams()['id'];

        this.cancelButtonElement.onclick = function () {
            location.href = '#/expenses';
        }

        const that = this
        this.saveButtonElement.onclick = function () {
            that.editCategoryExpense();
            location.href = '#/expenses';
        }

        this.init();
    }

    async init() {

        if (this.id) {
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense/' + this.id);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.categories = result;
                    this.inputExpenseElement.value = this.categories.title
                }
            } catch (error) {
                return console.log(error);
            }
        }
    }


    async editCategoryExpense() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/expense/' + this.id, "PUT", {
                title: this.inputExpenseElement.value
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