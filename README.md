# moz-scrbl v0.1.1

## Table of contents
- [General info](#general-info)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Acknowledgements](#acknowledgements)

## General info
This project is a prototype doodle and notation extension for browsers, designed in Firefox.
It is writen as a solution to create annotations of a document.

## Features
The extensions creates a page action to appear in the address bar of web pages, which when clicked will inject JavaScript into the target page enabling the apprearance of mouse-controlled freehand vectored annotation of the document.

- SVG based vector freehand drawing and erasal
- Show/hide action
- Hotkeys (unstable)
	
## Technologies
The project uses no external libraries but relies on strict JS, CSS and HTML as well as the WebExtensions Javascript API.
	
## Setup
The  project conforms to the standard browser extension design pattern.
To install it, see this [guide from Extension Workshop][1].
The extension will deploy automatically on installation.

## Acknowledgements
Iconography used in the project are IP of [Mozilla Photon][2] and [Materials.io][3].

Correct licencing not currently in place.


[1]:https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
[2]:https://design.firefox.com/photon/
[3]:https://material.io/
