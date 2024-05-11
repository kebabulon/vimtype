var app;

class App {
    constructor() {
        this.engine = new Engine();
    }
}


function app_init() {
    app = new App();
    app.engine.init();
}