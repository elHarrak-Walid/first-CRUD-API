//! method 1
//let data = { employees: require('../model/employees.json') };
//! method 2
/*const data = { 
  employees : require('../model/employees.json'),
  setemployees: function (data) {
    this.employees = data;
  }
};
// Somewhere else:
data.setemployees([
  ...data.employees,
  newEmployee
]);*/
//! method 3
const Employee = require('../model/employee')
/*const data ={};
data.employees = require('../model/employees.json');
const path = require('path');
const fs = require('fs').promises;
const dataPath = path.join(__dirname, '..', 'model', 'employees.json');
const saveData = async () => {
  await fs.writeFile(dataPath, JSON.stringify(data.employees, null, 2), 'utf-8');
};*/

//! getAllEmployees=======================================================
const getAllEmployees = async (req, res) => {
  const employees = await Employee.find();
  if (!employees) return res.status(204).json({ "message": "No employee has been foun" })
  res.json(employees);
  //res.json(data.employees);
}
//! createNewEmployee =======================================================
const createNewEmployee = async (req, res) => {
  // res.json({"firstname":req.body.firstname,
  //   "lastname":req.body.lastname});
  const { firstname, lastname } = req.body;
  if (!firstname || !lastname) {
    return res.status(400).json({ message: 'firstname and lastname are required' });
  }
  //! create an id 
  //!“If the thing before ?. is not null or undefined, then access the property. Otherwise, return undefined instead of throwing an error.”
  // const id = (data.employees[data.employees.length - 1]?.id + 1) || 1;
  // const newId = data.employees.length ? Math.max(...data.employees.map(e => e.id)) + 1 : 1;
  //const newEmployee = { id: newId, firstname, lastname };
  //data.employees.push(newEmployee);

  const result = await Employee.create({ firstname: firstname, lastname: lastname });
  console.log(result)

  try {
    // await saveData();
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    //! revert in-memory change if file write failed
    //data.employees = data.employees.filter(e => e.id !== newId);
    //res.status(500).json({ message: 'Could not save employee', error: err.message });
  }
};

//!updateEmployee=======================================================
const updateEmployee = async (req, res) => {
  //res.json({"firstname":req.body.firstname,
  // "lastname":req.body.lastname});
  const { id, firstname, lastname } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required" });

  //const employee = data.employees.find(emp => emp.id === parseInt(id));
  const employee = await Employee.findOne({ _id: id }).exec();
  if (!employee) return res.status(404).json({ message: `No employee matches ID ${id}` });

  if (firstname) employee.firstname = firstname;
  if (lastname) employee.lastname = lastname;

  try {
    // await saveData();
    // res.json(employee);
    const result = await employee.save(); //! ✅ Updates the refreshToken in the "users" array
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Could not update employee", error: err.message });
  }
};

//!deleteEmployee=======================================================
//! look at the splice Method image (important to undrestand the code)
const deleteEmployee = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required" });

  //const index = data.employees.findIndex(emp => emp.id === parseInt(id));
  //if (index === -1) return res.status(404).json({ message: `No employee with ID ${id}` });
  const employee = await Employee.findOne({ _id: id }).exec();
  if (!employee) return res.status(204).json({ message: `No employee matches ID ${id}` });
  const result = await employee.deleteOne({ _id: id }).exec();
  res.json(result);


  //! splice delete elmente at the index then returns it in an array then we accec it
  //! important : we save the deleted element in  the deleted variable not only to return it in the res but in cas if 
  //! the elment was'nt saved in the file due to a problem in the saving 
  //! we can reinsert it in the data.employees array again
  //! either everything succeeds (delete + save) or nothing changes.
  // const deleted = data.employees.splice(index, 1)[0];

  /*try {
    await saveData();
    res.json({ message: "Employee deleted", employee: deleted });
  } catch (err) {

    //! Rollback = undoing a change when something goes wrong.
    //! reinsert in case saving failed
    data.employees.splice(index, 0, deleted);
    res.status(500).json({ message: "Could not delete employee", error: err.message });
  }*/
};

//!getEmployee=======================================================
const getEmployee = async (req, res) => {
  const id = req.params.id; 
  if (!id) return res.status(400).json({ message: "ID is required" });
   const employee = await Employee.findOne({ _id: id }).exec();
  //const employee = data.employees.find(emp => emp.id === id);

  if (!employee) {
     return res.status(204).json({ message: `No employee matches ID ${id}` });
  } else {
    res.json(employee);
  }
}

module.exports = { getAllEmployees, createNewEmployee, updateEmployee, deleteEmployee, getEmployee }