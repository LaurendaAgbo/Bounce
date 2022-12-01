class Game {
	constructor () {

	}

	init () {
		const stage = document.getElementById("game-content");
		let ctx = stage.getContext("2d");
    
    let ball = {
			x: stage.width/2,
			y: stage.height - 30,
			vx: .2,
			vy: -.2,
			radius: 10
		};

		let colors = [
			'blue', 
			'blueviolet', 
			'black', 
			'brown', 
			'chartreuse', 
			'coral', 
			'forestgreen', 
			'goldenrod', 
			'sienna', 
			'deeppink'
		];

    let score = 0;
		
		let updateElements = {
			stage: stage,
			ctx: ctx,
			ball: ball,
			currentColor: 'white',
			ballColors: colors,
			score: score,
			clickEvents: 0,
			authorizedClicks: 4, 
			high_score: localStorage.getItem('bounce_high_score') > score ? localStorage.getItem('bounce_high_score') : score
		}

		this.generateWorld(updateElements);
	}

	showPopup (popup) {
    this.hidePopup('');
  
    if (popup == 'lose') {
      document.querySelector('#lose').style.display = 'flex';
    } else if (popup == 'start') {
      document.querySelector('#instructions').style.display = 'flex';
    }
  }
  
  hidePopup (popup) {
    if (popup == 'lose') {
      document.querySelector('#lose').style.display = 'none';
    } else if (popup == 'start') {
      document.querySelector('#instructions').style.display = 'none';
    }
    else if (popup == '') {
      document.querySelectorAll('.overlay').forEach(function (elm) {
        elm.style.display = 'none';
      });
    }
  }

	playMusic (music, volume) {
    let playing = document.querySelector(music);
		// Show loading animation.
		var playPromise = playing.play();

		if (playPromise !== undefined) {
			playPromise.then(_ => {
				// Automatic playback started!
				// Show playing UI.
			})
			.catch(error => {
				// Auto-play was prevented
				// Show paused UI.
			});
		}
    playing.volume = volume;
  }
  
  stopMusic (music) {
    if (music == '') {
      let sounds = document.getElementsByTagName('audio');
      for (let i = 0; i < sounds.length; i++) {
        sounds[i].pause();
      }
    }
  }

	generateWorld (updateElements) {
		const mainClass = this;
    let timer;

    this.playMusic('#playing', 0.1);
		this.displayClicks(updateElements.clickEvents, updateElements.authorizedClicks);
		this.keepScore(updateElements.score, updateElements.high_score);

		// Add mouse events
		updateElements.stage.addEventListener("mouseup", mainClass.onMouseUp);
		updateElements.stage.addEventListener("mouseout", mainClass.onMouseOut);
		updateElements.stage.addEventListener("mousemove", mainClass.onMouseMove);
		updateElements.stage.addEventListener("mousedown", function (e) {
			mainClass.onMouseDown(e, updateElements)
		});
		
		timer = setInterval(function () {	
			if (updateElements.clickEvents < updateElements.authorizedClicks) {
				mainClass.move(updateElements);
				if (updateElements.authorizedClicks - updateElements.clickEvents == 1) {
					mainClass.playMusic('#ticTac', 0.5);
				}
			} else {
        clearInterval(timer);
				updateElements.high_score = localStorage.getItem('bounce_high_score') > updateElements.score ? localStorage.getItem('bounce_high_score') : updateElements.score;
				localStorage.setItem('bounce_high_score', updateElements.high_score);
				mainClass.stopMusic('');
				mainClass.playMusic('#loseSound', 0.5);
				mainClass.showPopup('lose');
			}
		}, 20);
	}

	move (updateElements) {
		updateElements.ctx.clearRect(0, 0, updateElements.stage.width, updateElements.stage.height);
		this.drawBall(updateElements);
		
		if(updateElements.ball.x + updateElements.ball.vx > updateElements.stage.width-updateElements.ball.radius 
			|| updateElements.ball.x + updateElements.ball.vx < updateElements.ball.radius) {
				updateElements.ball.vx = -updateElements.ball.vx;
		}
		if(updateElements.ball.y + updateElements.ball.vy > updateElements.stage.height-updateElements.ball.radius 
			|| updateElements.ball.y + updateElements.ball.vy < updateElements.ball.radius) {
				updateElements.ball.vy = -updateElements.ball.vy;
		}
		
		updateElements.ball.x += updateElements.ball.vx;
		updateElements.ball.y += updateElements.ball.vy;
		
	}

	drawBall (updateElements) {
		updateElements.ctx.beginPath();
    updateElements.ctx.arc(updateElements.ball.x, updateElements.ball.y, updateElements.ball.radius, 0, Math.PI*2);
    updateElements.ctx.fillStyle = updateElements.currentColor;
    updateElements.ctx.fill();
    updateElements.ctx.closePath();
}

	keepScore (score, high_score) {
    document.getElementById('score').innerText = score;
    document.getElementById('highScore').innerText = high_score;
  }

	displayClicks (clickEvents, authorizedClicks) {
		document.getElementById('clicks').innerText = clickEvents;
    document.getElementById('authorizedClicks').innerText = authorizedClicks;
	}

	// Mouse event handlers
	onMouseUp (e) {}
	onMouseOut (e) {}
	onMouseMove (e) {}
	onMouseDown (e, updateElements) {
		// Get the mouse position
		var pos = this.getMousePos(updateElements.stage, e);

		updateElements.clickEvents += 1;
		this.playMusic('#click', 0.5);
		
		// Check if we clicked the ball
		if (pos.x >= updateElements.ball.x && pos.x < updateElements.ball.x + updateElements.ball.radius &&
			pos.y >= updateElements.ball.y && pos.y < updateElements.ball.y + updateElements.ball.radius) {

			this.playMusic('#match', 0.5);

			updateElements.score += 1000;
			this.keepScore(updateElements.score, updateElements.high_score);

			// Increase the speed of the ball
			updateElements.ball.vx = updateElements.ball.vx<0 ? updateElements.ball.vx - .2 : updateElements.ball.vx + .2;
			updateElements.ball.vy = updateElements.ball.vy<0 ? updateElements.ball.vy - .2 : updateElements.ball.vy + .2;
			
			// Give the ball a random position
			updateElements.ball.x = Math.floor(Math.random()*(updateElements.stage.width-updateElements.ball.radius));
			updateElements.ball.y = Math.floor(Math.random()*(updateElements.stage.height-updateElements.ball.radius));

			// Give the ball a random color
			let colorIndex = Math.floor(Math.random() * updateElements.ballColors.length);
			updateElements.currentColor = updateElements.ballColors[colorIndex];

			// Reset clicks for next level
			updateElements.clickEvents = 0;
			updateElements.authorizedClicks += 4;
		}
		
		this.displayClicks(updateElements.clickEvents, updateElements.authorizedClicks);
	}

	// Get the mouse position
	getMousePos(stage, e) {
		var rect = stage.getBoundingClientRect();
		return {
				x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*stage.width),
				y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*stage.height)
		};
	}
}
