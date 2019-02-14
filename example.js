const { windowsManager } = require("./dist/index");

console.log(windowsManager);

windowsManager.onActivated.addListener(window => {
    console.log(window.handle);
    process.exit(0);
});
