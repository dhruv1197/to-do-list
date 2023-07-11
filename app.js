//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const http = require("http");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://dhruvjain:Test123@cluster0.eoq6ve3.mongodb.net/itemsDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = new mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = new mongoose.model("list", listSchema);



app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){

  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
  if (err){
    console.log(err);
  }else{
    console.log("added to the collection");
  }
});
  res.redirect("/");
  }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems 
  });
  list.save();
  res.redirect("/" + customListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
  res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  });

app.post("/delete", function(req,res){
  const checkedById = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedById, function(err){
    if(!err){
      console.log("successfully deleted item.")
      res.redirect("/");
}
  });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedById}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  
  
});


/*
app.get("/about", function(req, res){
  res.render("about");
});
*/



let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("server has started successfully.");
});
