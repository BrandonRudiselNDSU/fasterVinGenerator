
chrome.commands.onCommand.addListener(function(command) {
    if(command === "clearOptions"){
        localStorage.clear();
        alert("All options have been cleared.");
    }
});