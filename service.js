const axios = require('axios');
const Promise = require('promise');
const apiUrl = 'http://swapi.co/api';

let swapiService = {};

swapiService.getPeople = () => {
	const path = '/people/?format=json';
	let people = [];
	return new Promise((resolve, reject) => {

		function getPersonData(url, done) {
            //make API Call as a promise
			axios.get(url).then(results => {
				let res = results.data;
                let nextUrl = res.next;
                
                //loop to create a combined array of people from each 10page result
				res.results.forEach(person => {
					if(people.length < 87) {
						people.push(person);
					} else {
						done(people);
					}
				});
                
                //check if we are at the final page
				if(nextUrl) {
					getPersonData(nextUrl, done);
				} else {
					done(people);
				}
			}, err => {
				reject(err.data);
			})
        }
        
		function done(people) {
			resolve(people);
		}

		getPersonData(apiUrl + path, done);
	})
}

swapiService.getPlanets = () => {
	const path = '/planets/?format=json';
    let planets = [];
    var planetResidents = [];
    let newPlanets = [];
    let currentPlanet= {}
    let currentPlanetResidents = [];
    let planetIndex = 0;
    let residentIndex = 0;
    
	return new Promise((resolve, reject) => {

		function getPlanetData(url, mapResidentsNames) {

            //make API call
            axios.get(url)
            .then(data => {
				let res = data.data;
                let nextUrl = res.next;
            
                //loop to create a combined array of planets from each 10page results
				res.results.forEach(planet => {
					planets.push(planet);
				});
                
                //check if we are at the final page
				if(nextUrl) {
					getPlanetData(nextUrl, mapResidentsNames);
				} else {
                    return planets;
				}
			}, err => {
				reject(err.data);
            })
            .then(()=>{
        
                //Swap Resident URL for residents names
                    mapResidentsNames();
               
            }, err=>{
                reject();
            })
        }

        function mapResidentsNames(done){

            // Check if planet exists
          if(typeof planets[planetIndex] != 'undefined'){
                currentPlanet = planets[planetIndex];
                if(typeof currentPlanet.residents[residentIndex] != 'undefined'){
                    

                    //API Call to get the residents data from the link
                    axios.get(currentPlanet.residents[residentIndex] + '?format=json')
                        .then(residentRes=>{

                            //Create temp array to hold the current planets residents via name
                            currentPlanetResidents.push(residentRes.data.name);
                        })
                        .then(()=>{
                            if(residentIndex<currentPlanet.residents.length - 1){

                                //increase counter and loop
                                residentIndex++;
                                mapResidentsNames();

                            }else{
                                //in here means we are done fetching names of current planet

                                //check if there are still more planets to fetch residents names
                                if(planetIndex<planets.length - 1){

                                    currentPlanet.residents = currentPlanetResidents;
                                    planets[planetIndex] = currentPlanet;
                                    residentIndex=0;

                                    //increment counter and check next planet then do swap

                                    planetIndex++;
                                    currentPlanetResidents=[];
                                    
                                    //loop
                                    mapResidentsNames();
                                    

                                }else{
                                    console.log('Done kabisaaa');
                                 
                                    //done!
                                    resolve(planets);
                                }
                            }
                        }, err => {

                            //ToDo: display better errr messages 
                            console.log('errrrra');
                        })
                    

                    }else{
                        residentIndex=0;
                        planetIndex++;
                        mapResidentsNames();
                    }
                // console.log(newPlanets)
           
        }
    }
    
        function done() {
            console.log('done');
			resolve(newPlanets);
		}

		// Initiating the process
		getPlanetData(apiUrl + path, mapResidentsNames);
	})
}



module.exports = swapiService;