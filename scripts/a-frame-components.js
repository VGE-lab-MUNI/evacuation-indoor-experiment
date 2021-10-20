var taskOr = getParameterByName('taskOr');
var taskCount = getParameterByName('taskCount');
var userId = getParameterByName('userId');

var responsesFile = userId + '_responses.csv';
var interactionFile = userId + '_interaction.csv';

var interaction = []; // virtual movement = rotation
var responses = []; // click
var scene = "";



/*
var time = 0;
var myVar = setInterval(counter, 10);

setInterval(function() {
	time = time + 10;
	console.log(time);
}, 10);

function counter (){
	timerValue = timerValue - 10;
	var sceneEl = document.querySelector('a-scene');
	if (timerValue > 0 ) {
		if (training == true) {
			sceneEl.querySelector("#timer").setAttribute('text', {width: 1.5, height: 1.5, align: 'center', color: 'red', value: (timerValue/1000).toFixed(2) + ' s     ' + 'Tr. task'}, true);
		} else {
			sceneEl.querySelector("#timer").setAttribute('text', {width: 1.5, height: 1.5, align: 'center', color: 'red', value: (timerValue/1000).toFixed(2) + ' s     ' + taskCount + '/35'}, true);
		}
	}
	else  {
		if (training == true) {
			sceneEl.querySelector("#timer").setAttribute('text', {width: 1.5, height: 1.5, align: 'center', color: 'red', value: (timerValue/1000).toFixed(2) + ' s     ' + 'Tr. task'}, true);
		} else {
			sceneEl.querySelector("#timer").setAttribute('text', {width: 1.5, height: 1.5, align: 'center', color: 'red', value: '0.00 s     ' +  taskCount + '/35'}, true);
		}
		clearInterval(myVar);
		responses.push([scene, userId, null, null, null, null, null]);
		$.when(
			saveDataToExistingFile(responsesFile, arrayToCSV(responses)),
			saveDataToExistingFile(interactionFile, arrayToCSV(interaction))
		).then(function() {
			if (training == true) {
				window.open(nextPage + "?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
			}
			else if (training == false && taskCount < 35) {
				taskCount = Number(taskCount) + 1;
				window.open("task.php?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
			}
			else {
				window.open("010_questionnaire.html?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
			}
		});
	}
};
*/	

function initTimer() {
	scene = document.getElementById('sky').getAttribute('src');
	scene = scene.substring(7,21);
	if (training == true) {
		scene = "tr_" + scene;
	};
	setTimeout(function(){
		console.log("timer started");
		var clock=document.getElementById("timer").components.timer;
		clock.start();
	}, 300);
}

AFRAME.registerComponent('timer', {
	schema: {
		TimeOutTime : {type:'int', default:5 }
	},
	init: function () {
		this.gotonext = true;
		var sceneEl = document.querySelector('a-scene');
		var date= new Date();
		this.TimeOutTime = this.data.TimeOutTime;
    	this.TargetTime = date.getTime() + this.TimeOutTime*1000;
		sceneEl.querySelector("#timer").setAttribute('text', {width: 1.5, height: 1.5, align: 'center', color: 'red', value: '5:00 s     ' +  taskCount + '/35'}, true);
		this.paused= true;
		console.log("timer registered");
		if (document.readyState === 'complete') {
			initTimer();
		} else {
			document.addEventListener('readystatechange', event => {
				var image = document.querySelector('img');
				console.log('scene loaded');
				if (image.complete && image.naturalHeight !== 0) {
					initTimer();
				}
			});
		}
	},
	TimeLeft:function(){
        let CurrentDate = new Date();
		CurrentDate = CurrentDate.getTime();
		this.wholeTimeRemaining = this.TargetTime - CurrentDate;
		/*
		let timeRemaining = this.TargetTime - CurrentDate;
		if (timeRemaining >= 0) {	
			this.seconda = parseInt(timeRemaining / 1000);
			timeRemaining = (timeRemaining % 1000);
			this.miliseconda = parseInt(timeRemaining);
    	};*/
    },
	tick: function () {
		//console.log(this.wholeTimeRemaining);
		if ((this.paused==false && this.wholeTimeRemaining > 0) || (this.paused==false && this.wholeTimeRemaining == undefined)) {
		    this.TimeLeft();
			var sceneEl = document.querySelector('a-scene');
			sceneEl.querySelector("#timer").setAttribute('text', {width: 1.5, height: 1.5, align: 'center', color: 'red', value: Math.max((this.wholeTimeRemaining/1000),0).toFixed(2) + ' s     ' +  taskCount + '/35'}, true);
		} else if (this.paused==false && this.gotonext == true) {
				responses.push([scene, userId, null, null, null, null, null]);
				$.when(
					saveDataToExistingFile(responsesFile, arrayToCSV(responses)),
					saveDataToExistingFile(interactionFile, arrayToCSV(interaction))
				).then(function() {
					if (training == true) {
						window.open(nextPage + "?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
					}
					else if (training == false && taskCount < 35) {
						taskCount = Number(taskCount) + 1;
						window.open("task.php?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
					}
					else {
						window.open("010_questionnaire.html?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
					}
				});
				this.gotonext = false; //prevent from loading nextPage each frame
			}
		},
	start: function () {
		var date= new Date();
		this.TargetTime = date.getTime() + this.TimeOutTime*1000;
		this.paused = false;
	}
  });
  
AFRAME.registerComponent('clickhandler', {
	schema: {
	  txt: {default:'default'}
	},
	init: function () {
	  var data = this.data;
	  var el = this.el;
	  el.addEventListener('click', function (evt) {
		var time = document.getElementById('timer').getAttribute('text');
		var timeS = time["value"].substring(0,1);
		var timeMs = time["value"].substring(2);
		var time = parseInt(timeS)*1000 + parseInt(timeMs);
		responses.push([scene, userId, time, data.txt, evt.detail.intersection.point.x, evt.detail.intersection.point.y, evt.detail.intersection.point.z]);
		if ((data.txt == "corridor_left") || (data.txt == "corridor_right")) {
			$.when(
				saveDataToExistingFile(responsesFile, arrayToCSV(responses)),
				saveDataToExistingFile(interactionFile, arrayToCSV(interaction))
			).then(function() {
				if (training == true) {
					window.open(nextPage + "?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
				}
				else if (taskCount < 35) {
					taskCount = Number(taskCount) + 1;
					window.open("task.php?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
				} else {
					window.open("010_questionnaire.html?taskOr=" + taskOr + "&taskCount=" + taskCount + "&userId=" + userId, "_self");
				}
			});
		}
	  });
	}
});

AFRAME.registerComponent('rotation-reader', {
	tick: function () {
		var time = document.getElementById('timer').getAttribute('text');
		var timeS = time["value"].substring(0,1);
		var timeMs = time["value"].substring(2);
		var time = parseInt(timeS)*1000 + parseInt(timeMs);
		interaction.push([scene, userId, time, "rotate", this.el.object3D.rotation.x, this.el.object3D.rotation.y]);
	}
});
