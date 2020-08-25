const Item = require('../models/listitem');
const Participant = require('../models/participant');
const moment = require('moment')

module.exports.homeController = function (req, res) {
  Item.find({}, function (err, toDoList) {

    if (err) { console.log('error in printing list'); return; }
    var offset = -5.5 * 3600000;
    var ans = [];
    toDoList.forEach(function(item){
      var temp = {}
      var startTime =  moment(item.startTime).format('dddd ,MMMM Do YYYY, h:mm a');
      var endTime =moment(item.endTime).format('dddd ,MMMM Do YYYY, h:mm a'); 
      temp.description = item.description;
      temp.startTime = startTime
      temp.endTime = endTime
      ans.push(temp);
    })
    return res.render('home', {
      list:ans,
    });
  }
  )
}

module.exports.createList = function (req, res) {
  var startDate = req.body.date +"T"+req.body.start_time +"+05:30"
  startDate = new Date(startDate);
  var endDate =  req.body.date +"T"+req.body.end_time +"+05:30"
  endDate = new Date(endDate);
  Item.create({
    description: req.body.description,
    category: req.body.category,
    startTime: startDate,
    endTime : endDate,
  }, function (err, newConatact) {
    if (err) {
      console.log('error in creating',err);
      return;
    }
    return res.redirect('back');
  }
  )
}

module.exports.DeleteList = function (req, res) {
  for(let i in req.body){
    
     Item.findByIdAndDelete(req.body[i], function (err) {
      if (err) {
        console.log('error in deleting'); return;
      }

    })
  }
  return res.redirect('back');
}