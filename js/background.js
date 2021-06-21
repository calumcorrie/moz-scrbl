"use strict";

const test_injection = {code: 'document.querySelector("#scrbl-extension_root")===null;'};
const main_injection = {file: browser.runtime.getURL("js/scrbl-main.js")};
const active_tab = {currentWindow: true, active: true};

browser.runtime.onMessage.addListener(messagein);

function fail(){
    console.log("Failed");
    browser.runtime.sendMessage({"type":"Popup.Feedback", "txt":"Failed"});
}

function success(){
    console.log("Success");
    browser.runtime.sendMessage({"type":"Popup.Die"});
}

function pageAction(){
    console.log("Testing presence");
    browser.tabs.executeScript( test_injection ).then( test_result ).catch( fail );
}

function test_result(result){
    console.log(result[0] ? "Injecting scrbl-main.js" : "Root already exists in page");
    if(result[0]==true){
        inject();
    } else {
        existing();
    }
}
    
function inject(){
    browser.tabs.executeScript( main_injection ).then(success,fail);
}

function existing(){
    console.log("Existing");
    browser.runtime.sendMessage({type:"Popup.Feedback", txt:"Already running", action:"showHides"});
    messageout({type:"Content.GetVis"});
}

function messagein(message){
    console.log("Background Rx:", message);
    if(message.type=="PageAction"){
        pageAction();
    }
}

function messageout(message){
    browser.tabs.query(active_tab).then((tabs)=>{browser.tabs.sendMessage(tabs[0].id, message );} );
}