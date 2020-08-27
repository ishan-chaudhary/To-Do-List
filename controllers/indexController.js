const Item = require('../models/listitem');
const Participant = require('../models/participant');
const moment = require('moment');
const { Mongoose } = require('mongoose');

module.exports.homeController = async function (req, res) {
  try{
    let toDoList = await Item.find({}).populate('participants');
    var offset = -5.5 * 3600000;
    var ans = [];
    toDoList.forEach(function (item) {
      var temp = {}
      var startTime = moment(item.startTime).utc().format();
      var endTime = moment(item.endTime).utc().format();
      delete temp.__v;
      temp.startTime =startTime
      temp.endTime = endTime
      temp._id = item._id
      temp.description = item.description
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

module.exports.getInfo = async (req, res) => {
  try {
    let info = await Item.findById(req.query.id).populate('participants');
    return res.status(200).json({
      data: info
    })
  } catch (err) {
    if (err) { console.log(err); return; }
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

module.exports.DeleteList = async function (req, res) {
  await Item.findByIdAndDelete(req.query.id)
  req.flash('success','Task Delete Successfuly')
  return res.redirect('/');
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