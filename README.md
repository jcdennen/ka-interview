# ka-interview

A collection of javascript testing APIs that uses Esprima.js to parse a user's code and notify the users
in real time of whether or not they meet a set of specified requirements

This project was created per request by Khan Academy as a part of their Summer Intern interview process

## About
The project is built and run using Node.js. I used Express.js to generate a basic web application that I
could use as a base for my testing API. The actual code for the testing API resides in testing.js, and is
in jQuery format. The javascript parser used is **Esprima.js**. I chose this parser, as it was the easiest to
setup, provided adequate documentation right on the website, and also provided some live examples of the
parse working in a web app environemnt with a live text editor. While Acorn tested slightly faster on 
multiple benchmarks, it did not appear to be enough of a difference to cause any noticeable delays or
lags on my local machine.

## Dependencies
This project uses Express.js, Esprima.js, and a Bootstrap minified css file to add some structure. Other
Express related dependencies include: body-parser, debug, and jade. All Node.js dependencies can be 
installed by simply running `npm install --save` after cloning this repository. This parser should work
on all modern Browsers (Chrome, Firefox, Safari, IE9+)

## Moving forward
Future additions to this project may include:
* Improving UI/UX (red or green text, moving requirements out of vertical stack)
* Adding more items to whitelist/blacklist
* Adding more items to dropdown strcture requirements
* Ability for user to dynamically add more structure requirements
* Dynamically setting whitelist,blacklist,etc. in Jade by means of a backend array
..* Could read all `"type"`s from JSON string and store new ones into backend array (a method to learn new syntax from Esprima.js
