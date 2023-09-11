// Import our custom CSS
import './scss/style.scss'
import Collapse from 'bootstrap/js/dist/collapse'
import Popper from 'bootstrap/js/dist/dropdown'
import {Router} from "./router.js";

class App {

    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded',this.handleRouteChanging.bind(this));
        window.addEventListener('popstate',this.handleRouteChanging.bind(this));
    }

    handleRouteChanging() {
        this.router.openRoute();
    }

}

(new App());