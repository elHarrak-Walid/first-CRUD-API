
const express = require('express');
const router= express.Router();
const employeesController = require('../../controllers/employeesController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/rolesListe');

router.route('/')
.get(/*verifyJWT,*/employeesController.getAllEmployees)
.post(verifyRoles(ROLES_LIST.admin,ROLES_LIST.editor),employeesController.createNewEmployee)
.put(employeesController.updateEmployee)
.delete(employeesController.deleteEmployee)

router.route("/:id")
.get(employeesController.getEmployee)

module.exports = router ;