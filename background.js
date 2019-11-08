chrome.commands.onCommand.addListener(function(command) {
    if(command === "clearOptions"){
        localStorage.clear();
    }
});
