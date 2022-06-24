const { MongoClient } = require("mongodb");
var session = require('express-session');
//Connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const express = require('express');
const router = new express.Router()
router.use(
  session({
    name: 'Restaurant',
    secret: 'restaurant',
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
router.get("/explore",async function (req,res){  
  try{
    await client.connect();
    const database = client.db('ny');
    const restaurants = database.collection('restaurants');
    const cuisine = await restaurants.distinct("cuisine");
    const borough = await restaurants.distinct("borough");
    if(req.session.data){
    res.render('explore',{cuisines:cuisine,boroughs:borough,restaurants: req.session.data})
    }
    else{
      res.render('explore',{cuisines:cuisine,boroughs:borough,name:"Aucun restaurant trouvé"})
    }
  }catch(e){
        console.log(e)
  }
});
router.get("/explo",async function (req,res){  
  try{
    await client.connect();
    const database = client.db('ny');
    const restaurants = database.collection('restaurants');
    const query = {cuisine:req.query.cuisine,borough:req.query.borough};
    const restaurant = await restaurants.find(query);
    const data = await restaurant.toArray();
    req.session.data = data;
    res.redirect("/explore")
  }catch(e){
        console.log(e)
    }
});
router.get("/note", getNote);
router.get("/score",async function (req,res){  
  req.session.destroy
  if(req.query.name && req.query.name && req.query.score){
  try{
    await client.connect();
    const database = client.db('ny');
    const restaurants = database.collection('restaurants');
    const findrestaurant = restaurants.find({name: req.query.name})
    const isRestaurant =  await findrestaurant.toArray()
    if(isRestaurant.length > 0){
    const restaurant = await restaurants.updateOne( { name: req.query.name }, {"$push":{ "grades": {  date : new Date(Date.now()).toISOString() , grade : req.query.grade,score: req.query.score} }})
    req.session.submit = "Envoie de la note"
    res.redirect("/note")
  }
    else{
      req.session.error = "Nom du restaurant introuvable"
      res.redirect("/note")
    }
  }catch(e){
        console.log(e)
    }
  }
  else{
    req.session.error = "Champ vide"
    res.redirect("/note")
  }
});

function getHome(req, res) {
  res.render('index');
}

function getRestau(req,res){
  if(req.session.data?.length > 0){
  res.render('restau',{restaurants: req.session.data})
  }else{
  res.render('restau',{name:"Restaurant pas trouvé"})


  }
}

function getNote(req,res){
  if(req.session.error){
    res.render('note',{error:req.session.error})
  }
  else if(req.session.submit){
  res.render('note',{submit:req.session.submit})
  }
  else{
    res.render('note')
  }
}


// Exporte le routeur pour le fichier principal
module.exports = router;