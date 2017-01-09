var kue = require('kue'),
    jobs = kue.createQueue();

module.exports = {

  newJob : function (name,data){
   name = name || 'Default_Name';
   var job = jobs.create('new job', {
     name: name,
     data: data
   });
   job.on('complete', function (){
       console.log('Job', job.id, 'with name', job.data.name, 'is    done');
     })
     .on('failed', function (){
       console.log('Job', job.id, 'with name', job.data.name, 'has  failed');
     });
   job.save();
  }

}

// jobs.process('new job', data, function (job, done){
//  /* carry out all the job function here */
//  done && done();
// });
// setInterval(function (){
//  newJob('Send_Email');
// }, 3000);
