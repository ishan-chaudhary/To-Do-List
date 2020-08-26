const Item = require('../models/listitem');
const Participant = require('../models/participant');
const moment = require('moment');

module.exports.homeController = async function (req, res) {
  try{
    let toDoList = await Item.find({}).populate('participants');
    var offset = -5.5 * 3600000;
    var ans = [];
    toDoList.forEach(function (item) {
      var temp = {}
      var startTime = moment(item.startTime).format('dddd ,MMMM Do YYYY, h:mm a');
      var endTime = moment(item.endTime).format('dddd ,MMMM Do YYYY, h:mm a');
      delete temp.__v;
      temp._id = item._id;
      temp.description = item.description;
      temp.startTime = startTime
      temp.endTime = endTime
      temp.participants = [];
      for(let i = 0;i<item.participants.length;i++){
        temp.participants.push({
          name : item.participants[i].name,
          phone : item.participants[i].phone,
          email : item.participants[i].email,
        })
      }
      ans.push(temp);
    })
    let participants = await Participant.find({});
    return res.render('home', {
      list: ans,
      participants: participants
    });
  }catch(err){
    if (err) { console.log('error in printing list',err); return; }
  }
}

module.exports.createList = async function (req, res) {
  var startDate = req.body.date + "T" + req.body.start_time + "+05:30"
  startDate = new Date(startDate);
  var endDate = req.body.date + "T" + req.body.end_time + "+05:30"
  endDate = new Date(endDate);
  if(typeof(req.body.pid) != 'object'){
    req.flash('error','Number of Participants less than 2')
    return res.redirect('back');
  }
  try {
    let item = await Item.findOne({
      $and: [{ participants: {$in:req.body.pid} }, {
        $or: [{
          $and: [{ startTime: { $lte: startDate } }, { $and:[{endTime: { $gte: startDate }},{endTime: { $lte: endDate }}] }]
        }, 
        {
          $and: [ {$and:[{startTime: { $gte: startDate }},{startTime: { $lte: endDate }}] }, { endTime: { $gte: endDate } }]
        },
        {
          $and: [{ startTime: { $gte: startDate } }, { endTime: { $lte: endDate } }]
        }]
      }]
    }
    );
    if (item) {
      req.flash('error','Time clash with one of the participants')
      return res.redirect('back');
    } else {
      Item.create({
        description: req.body.description,
        category: req.body.category,
        startTime: startDate,
        endTime: endDate,
        participants: req.body.pid
      }, function (err, newConatact) {
        if (err) {
          console.log('error in creating', err);
          return;
        }
        req.flash('success','Interview Scheduled Successfully')
        return res.redirect('back');
      }
      )
    }
  } catch (err) {
    if (err) {
      console.log('error in creating', err);
      return res.redirect('back');
    }
  }
}

module.exports.DeleteList = function (req, res) {
  for (let i in req.body) {
    Item.findByIdAndDelete(req.body[i], function (err) {
      if (err) {
        console.log('error in deleting',err); return;
      }

    })
  }
  return res.redirect('back');
}

module.exports.addParticipant = async (req, res) => {
  try {
    await Participant.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email
    })
    return res.status(200).json({
      message: 'Participant Created'
    })
  } catch (err) {
    if (err) {
      console.log('error in creating', err);
      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  }
}