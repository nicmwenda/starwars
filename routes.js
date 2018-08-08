const express = require('express');
let router = express.Router();
const swapiService = require('./service');


//home
router.get('/', function (req, res) {
	
	res.send('HOMEPAGE');
});


//get all characters
router.get('/people', function(req, res) {

	let sortOption = req.query.sortBy;

	let peopleCollection = swapiService.getPeople();
	peopleCollection.then(people => {
		if(!sortOption) {
			res.json(people);
		}
		else if( sortOption) {
            
			if(sortOption == 'name') {
				people.sort(function(a, b) {
                     return a.name.localeCompare(b.name); 
                    });
			} else if(sortOption == 'mass') {
				people.sort(function(a,b){
				  return (a.mass - b.mass);
				});
            } else if(sortOption == 'height') {
				people.sort(function(a,b){
				  return (a.height - b.height);
				});
            } 
			res.json(people);
		} else {
			res.json({error: 'Error Sorting'});
		}
	})
});

// get all residents
router.get('/planets', function(req, res) {

    let planetCollection = swapiService.getPlanets();
    
	planetCollection.then(planets => {
		res.json(planets);
	});

});


module.exports = router;