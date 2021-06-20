"use strict";

console.log("ITS ME");

// Constants
const PACKAGE = "scrbl-extension";
const SVG_NS = 'http://www.w3.org/2000/svg';

const PENS = [
    { name:"Eraser",    weight:0, style:""      },
    { name:"Red Pen",   weight:3, style:"red"   },
    { name:"Green Pen", weight:3, style:"green" },
    { name:"Blue Pen",  weight:3, style:"blue"  }
];

const ROOT_ID       = uniq("root");
const SURFACE_CLASS = uniq("surface");
const TRAY_ID       = uniq("tray");
const HD_CLASS      = uniq("ink"); // Hand Drawn
const INDIC_CLASS   = uniq("indicator");
const HOTKEY_CLASS  = uniq("hotkey");

const FADE_IN_CLASS     = uniq("anim-fade-in");
const FADE_OUT_CLASS    = uniq("anim-fade-out");
const GONE_CLASS        = uniq("gone");
const ROOT_COLLAPSE     = uniq("root-collapse");
const SURFACE_FADE_DUR  = 250;
const SLIDE_IN_CLASS    = uniq("anim-slide-in");
const SLIDE_OUT_CLASS   = uniq("anim-slide-out");
const INDIC_ON_CLASS    = uniq("indicator-on");
const INDIC_SLIDE_DUR   = 500;
const DROP_IN_CLASS     = uniq("anim-drop-in");
const DROP_OUT_CLASS    = uniq("anim-drop-out");
const CELL_DROP_DUR     = 250;

const ICON_ROOT = "icons/";
console.log("BC4");
const MENU_PEN_IC_ASSET    = browser.runtime.getURL(ICON_ROOT + "edit.svg");
const MENU_BIN_IC_ASSET    = browser.runtime.getURL(ICON_ROOT + "delete.svg");
const MENU_RETURN_IC_ASSET = browser.runtime.getURL(ICON_ROOT + "back.svg");
console.log("BC6");

// UI
let root = document.createElement("div");

// Surface
let surface = document.createElementNS(SVG_NS, "svg");

console.log("BRR");

// Drawing
let visible = false;
let stylo = 1;
let current_line = null;
let pathdata = "";
let dragged = false;

// UI Tray
let tray = document.createElement("div");
let menu = [ 
    { name:"Pen",    src:MENU_PEN_IC_ASSET,    action_class:drawClick,   action:null, indicator:null, hotkey:"W", extra_classes:[] },
    { name:"Eraser", src:MENU_BIN_IC_ASSET,    action_class:eraseClick,  action:null, indicator:null, hotkey:"E", extra_classes:[] },
    { name:"Return", src:MENU_RETURN_IC_ASSET, action_class:returnClick, action:null, indicator:null, hotkey:"Q", extra_classes:[GONE_CLASS] }
];


console.log("B2");

// # Setup
// UI root
root.id = ROOT_ID;
root.classList.add(ROOT_COLLAPSE);
document.body.appendChild(root);

// Surface
surface.classList.add(SURFACE_CLASS);
root.appendChild(surface);
surfaceHide(true);

if(window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(setSurfaceDims);
    resizeObserver.observe(document.documentElement);
} else {
    console.log('Resize observer not supported!');
}
setSurfaceDims();

console.log("B3");

// Drawing event handlers
surface.addEventListener("mousedown", mouseDown, true);
surface.addEventListener("mouseup", mouseUp );
window.addEventListener("keydown", shortkey );

console.log("B4");

// UI Tray
tray.id = TRAY_ID;
root.appendChild(tray);

{
    for(let i=0;i<menu.length;i++){
        let item_def = menu[i];
        let container = document.createElement("div");
        let icon = document.createElement("img");
        let indicator = document.createElement("span");
        let hotkey = document.createElement("span");
        
        let clickclosure = function(){
            item_def.action_class(container,icon,indicator,hotkey);
        };
        
        indicator.classList.add(INDIC_CLASS);

        container.addEventListener("click", clickclosure);
        for(let j=0;j<item_def.extra_classes.length;j++){
            container.classList.add(item_def.extra_classes[j]);
        }
        
        icon.src = item_def.src;

        hotkey.classList.add(HOTKEY_CLASS);
        hotkey.innerHTML = item_def.hotkey;

        tray.appendChild(container);
        container.appendChild(indicator);
        container.appendChild(icon);
        container.appendChild(hotkey);
        
        item_def.indicator = indicator;
        item_def.action = clickclosure;
    }
}

console.log("B5");

// # Hoisted subroutines and functions

function uniq(id_str){
    // Attribute and tag uniquer - to avoid conflict with host page
    return PACKAGE + "_" + id_str;
}

function sel(_class){
    // general CSS selector from class name
    return "." + _class;
}

function mouseDown(e){
    if(stylo==0){
        eraserDown();
    } else {
        penDown(e);
        window.addEventListener("mousemove", move, true);
    }
}

function move(e){
    penDrag(e);
}

function mouseUp(e){
    if(stylo==0){
        eraserLift();
    } else {
        window.removeEventListener("mousemove", move, true);
        penLift(e);
    }
}

// # UI subroutines
function animate_transition( subject, end_state, transition, duration, add=true, additional_callback=function(){} ){
    // Add (or remove) a transition animation class
    // Read: ( <add> ? Add to : Remove from ) <subject> the state of class <end_state> by
    ////     invoking animation defined in state <transition> which takes <duration>ms,
    ////     finally do <additional_callback>
    
    subject.classList.add(transition);
    setTimeout(function(){
        //After duration millis
        if(end_state !== null){
            //Add or remove the final state class, or dont if not needed (null)
            if(add){
                subject.classList.add(end_state);
            } else {
                subject.classList.remove(end_state);
            }
            additional_callback();
        }
        //Remove the transitional class
        subject.classList.remove(transition);
    }, duration );
}

function shortkey(event){
    for(var i=0;i<menu.length;i++){
        if(event.key.toUpperCase() == menu[i].hotkey){
            menu[i].action();
            return;
        }
    }
}

function surfaceShow(immediate=false){
    surface.classList.remove(GONE_CLASS);
    root.classList.remove(ROOT_COLLAPSE);
    if(!immediate){
        animate_transition( surface, null, FADE_IN_CLASS, SURFACE_FADE_DUR );
        menu[2].action();
    }
    visible = true;
}

function surfaceHide(immediate=false){
    visible = false;
    let shrink_callback = function(){ root.classList.add(ROOT_COLLAPSE); };
    if(immediate){
        surface.classList.add(GONE_CLASS);
        shrink_callback();
    } else {
        animate_transition( surface, GONE_CLASS, FADE_OUT_CLASS, SURFACE_FADE_DUR, true, shrink_callback );
    }
    clearIndicators();
}

function setSurfaceDims(){
    let h = max(document.documentElement.scrollHeight,document.documentElement.offsetHeight);
    let w = max(document.documentElement.scrollWidth,document.documentElement.offsetWidth);
    surface.setAttribute("height", h );
    surface.setAttribute("width", w );
    console.log("Changed to w" + w + " h" + h);
}

function clearIndicators(){
    for(var i=0;i<menu.length;i++){
        if(menu[i].indicator !==null && menu[i].indicator.classList.contains(INDIC_ON_CLASS)){
            animate_transition(menu[i].indicator, INDIC_ON_CLASS, SLIDE_OUT_CLASS, INDIC_SLIDE_DUR, false);
        }
    }
}

function drawClick(container, icon, indicator, hotkey){
    let was_visible = visible;
    let was_erasing = stylo===0;
    
    if(visible || was_erasing){
        //If not minimised on a pen mode
        cyclePens();
    }
    
    if(!visible){
        surfaceShow();
        //visible now true
    }
    
    if(was_visible && was_erasing){
        //Old indicator to animate out
        clearIndicators();
    }
    
    if(!was_visible || was_erasing){
        //Hidden indicator to animate in
        animate_transition( indicator, INDIC_ON_CLASS, SLIDE_IN_CLASS, INDIC_SLIDE_DUR );
    }

    //Colour the indicator
    indicator.style.backgroundColor = PENS[stylo].style;
}

function eraseClick(container, icon, indicator, hotkey){
    let was_visible = visible;
    let was_erasing = stylo===0;
    
    setEraser();
    
    if(!visible){
        surfaceShow();
        //visible now true
    }
    
    if(was_visible && !was_erasing){
        //Old indicator to animate out
        clearIndicators();
    }
    
    if(!(was_visible && was_erasing)){
        //Hidden indicator to animate in
        animate_transition( indicator, INDIC_ON_CLASS, SLIDE_IN_CLASS, INDIC_SLIDE_DUR );
    }
    
}

function returnClick(container, icon, indicator, hotkey){
    if(visible){
        surfaceHide();
        animate_transition(container, GONE_CLASS, DROP_OUT_CLASS, CELL_DROP_DUR );
    } else {
        //Triggered by pen show
        container.classList.remove(GONE_CLASS);
        animate_transition(container, null, DROP_IN_CLASS, CELL_DROP_DUR );
    }
}

// # Drawing subroutines
function penDown(e){
    current_line = document.createElementNS( SVG_NS, "path");
    current_line.setAttribute("stroke", PENS[stylo].style);
    current_line.setAttribute("stroke-width", PENS[stylo].weight);
    current_line.setAttribute("fill","none");
    current_line.classList.add(HD_CLASS);
    surface.appendChild(current_line);
    //pathdata = "M " + e.pageX + " " + e.pageY;
    pathdata = "M" + e.offsetX + " " + e.offsetY;
}

function penDrag(e){
    //pathdata = pathdata + " L " + e.pageX + " " + e.pageY;
    pathdata = pathdata + " L" + e.offsetX + " " + e.offsetY;
    current_line.setAttribute("d", pathdata);
    dragged = true;
}

function penLift(e){
    if(!dragged){
        surface.removeChild(current_line);
        var dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx",e.offsetX);
        dot.setAttribute("cy",e.offsetY);
        dot.setAttribute("r", PENS[stylo].weight);
        dot.setAttribute("fill", PENS[stylo].style);
        dot.classList.add(HD_CLASS);
        surface.appendChild(dot);
    }
    current_line = null;
    pathdata = "";
    dragged = false;
}

function eraserDown(){
    var els = surface.querySelectorAll(sel(HD_CLASS));
    for(var i=0;i<els.length;i++){
        els[i].addEventListener("mouseenter", erase);
    }
}

function eraserLift(){
    var els = surface.querySelectorAll(sel(HD_CLASS));
    for(var i=0;i<els.length;i++){
        els[i].removeEventListener("mouseenter", erase);
    }
}

function setEraser(){
    stylo = 0;
    console.log("PEN -> " + PENS[stylo].name);
}

function cyclePens(){
    stylo++;
    stylo %= PENS.length;
    if(stylo == 0){ stylo++; }
    console.log("PEN -> " + PENS[stylo].name);
}

function erase(event){
    surface.removeChild(event.target);
}

function max(a,b){
    return a >= b ? a : b;
}



console.log("END");

    

