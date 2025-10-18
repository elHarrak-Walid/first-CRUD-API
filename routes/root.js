const path = require('path');
const express = require('express');
const router= express.Router();
 
router.get(/^\/$|^\/index(.html)?$/, (req, res) => {
res.sendFile(path.join(__dirname, '..','view','index.html'));
console.log(`request url: ${req.url} \trequest method :${req.method}`)});


router.get(/^\/new-page(.html)?$/,(req, res)=>{   
res.sendFile(path.join(__dirname, '..', 'view', 'new-page.html'));
console.log(`request url: ${req.url} \trequest method :${req.method}`)});

router.get(/^\/old-page(.html)?$/,(req, res)=>{   
res.redirect(301,'/new-page.html')
console.log(`request url: ${req.url} \trequest method :${req.method}`)});


module.exports = router ;