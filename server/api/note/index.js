'use strict';

var express = require('express');
var controller = require('./note.controller');

var router = express.Router();

// show all
router.get('/', controller.index);

// get one
router.get('/:id', controller.show);

module.exports = router;
