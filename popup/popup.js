"use strict";

const maindiv = document.getElementById("main");
const hideexisting = document.getElementById("existing_options");
const hidebttn = document.getElementById("softhide");

const activetab = {currentWindow: true, active: true};

browser.runtime.onMessage.addListener(response);

/*Request a status update to show in popup. Returns {Die} || {Feedback} || {Feedback,ReportVis} */
browser.runtime.sendMessage({type:"PageAction"});

function response(message){
    console.log("Popup Rx: ", message);
    switch(message.type){
        case "Popup.Die": {
            window.close();
            break;
        }
        
        case "Popup.Feedback" : {
            maindiv.innerHTML=message.txt;
            break;
        }
        
        case "Popup.ReportVis" : {
            setHideButton(message.value);
        }
            
    }
    
    switch(message.action){
        case null:
            break;
        case "showHides":{
            hideexisting.style.display = "unset";
            break;
        }
    }      
}

function setHideButton(isvis){
    hidebttn.innerHTML = isvis ? "Hide" : "Show";
    hidebttn.removeEventListener("click",hide);
    hidebttn.removeEventListener("click",show);
    hidebttn.addEventListener("click", isvis ? hide : show );
}

function show(){
    setVis(true);
}

function hide(){
    setVis(false);
}

function setVis(visible){
    sendtoActive({type:"Content.SetVis", value:visible});
    setHideButton(visible);
}
    
function sendtoActive(message){
    browser.tabs.query(activetab).then(
        (tabs) => {browser.tabs.sendMessage(tabs[0].id, message);}
    );
}