"use strict";
let Sounds={
	meow:"sounds/Meow.wav",
};
//new Promise(function(){
	for(let i in Sounds){
		let sound=new Audio(Sounds[i]);
		//img.src=Images[i];
		Sounds[i]=sound;
	}
//});
//Sound.start(Sounds.meow);