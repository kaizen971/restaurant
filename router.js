const { MongoClient } = require("mongodb");
var session = require('express-session');
//Connection URI
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

const express = require('express');
const router = new express.Router()


router.use(
  session({
    name: 'Chocolatier_yams',
    secret: 'chocolatier_yams',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 3600 * 1000 },
  })
);
router.use(express.static('public'));
/**
 * Déclaration des routes de l'app
 */
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/", getHome);
router.get("/restau", getRestau);
router.get("/explore",async function (req,res){  
  try{
    await client.connect();
    const database = client.db('ny');
    const restaurants = database.collection('restaurants');
    const restaurant = await restaurants.distinct("cuisine");
    const borough = await restaurants.distinct("borough");

    req.session.select = restaurant;
    if(req.session.data){
    res.render('explore',{cuisines:restaurant,boroughs:borough,restaurants: req.session.data})
    }
    else{
      res.render('explore',{cuisines:restaurant,boroughs:borough,name:"Aucun restaurant trouvé"})
    }
  }catch(e){
        console.log(e)
  }
});

router.get("/explo",async function (req,res){  
  console.log(req.query)
  try{
    await client.connect();
    const database = client.db('ny');
    const restaurants = database.collection('restaurants');
    const query = {cuisine: { $regex: req.query.cuisine},borough:{ $regex: req.query.borough}};
    const restaurant = await restaurants.find(query);
    const data = await restaurant.toArray();
    req.session.data = data;
    res.redirect("/explore")
  }catch(e){
        console.log(e)
    }
});

router.get('/resto', async function (req, res) {
  try{
    await client.connect();
    const database = client.db('ny');
    const restaurants = database.collection('restaurants');
    const query = {name: { $regex: req.query.name}};
    const restaurant = await restaurants.find(query);
    const data = await restaurant.toArray();
    req.session.data = data;
    res.redirect("/restau")

  }catch(e){
        console.log(e)
    }
});

/**
 * Déclaration des controlleurs de l'app
 */

/**
 * GET /
 * Page d'accueil
 */
function getHome(req, res) {
  res.render('index');
}
function getRestau(req,res){
  if(req.session.data?.length > 0){
    console.log(req.session.data)
  res.render('restau',{restaurants: req.session.data})
  }else{
  res.render('restau',{name:"Restaurant pas trouvé"})


  }
}



// Exporte le routeur pour le fichier principal
module.exports = router;