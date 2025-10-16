const path = require('path');
const express = require('express');
const router= express.Router();
 
// /$|^\
router.get(/^\/$|^\/index(.html)?$/, (req, res) => {
res.sendFile(path.join(__dirname, '..','view','subdir','index.html'));
console.log(`request url: ${req.url} \trequest method :${req.method}`)});


router.get(/^\/test(.html)?$/,(req, res)=>{   
res.sendFile('../view/subdir/test.html',{root:__dirname})
console.log(`request url: ${req.url} \trequest method :${req.method}`)});

module.exports = router ;