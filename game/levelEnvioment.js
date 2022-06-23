class Level{
	name;
	module=new MainGame.UpdateModule([]);
	constructor(name="",gridData,init,extraTypes={}){
		init??=()=>{};
		this.name=name;
		this.tileMap={...this.tileMap,...extraTypes};
		this.startGrid=gridData;
		init.call?.(this,{self:this,module:this.module,levelEnvironmentMenu,player});
	}
	startGrid=``;
}
Level.prototype.tileMap={
	"#":"wall",
	".":"space",
	"p":"player",
	"£":"goal",
	//"d":"door",
	//"k":"key",
	//for saves
	"D":"openDoor",
	"K":"collectedKey",
};
const keys={};//temporary variable
for(let i="a".charCodeAt(0);i<"o".charCodeAt(0);i++){
	let keyLetter=String.fromCharCode(i);
	Level.prototype.tileMap[keyLetter]="key";//'a-o' = key
	Level.prototype.tileMap[keyLetter.toUpperCase()]="door";//'A-O'=door
	keys[keyLetter]=0;
}
Level.prototype.reverseTileMap={};
for(let i in Level.prototype.tileMap){
	Level.prototype.reverseTileMap[Level.prototype.tileMap[i]]=i;
}
window.player={};
class Player extends MainGame.UpdateModule{
	pos=[0,0];//coordinates of the current tile the player is on
	animationPos=this.pos;//the current position that will be displayed to the user
	keys=keys;
	constructor(){
		super([]);
		for(let i in this.keys){//inisialise keys
			this.keys[i]=0;
		}
		//player update
		this.add(new MainGame.UpdateScript(l=>l.update[10],(function*(l,s){
			let oldMove=Math.vec2(0,0);
			while(true){
				if(this.hasWon){
					winGame();
					yield;
				}
				this.animationPos=this.pos;
				//movement
				const moveKeys=Inputs.getKey("KeysBoth");
				if(moveKeys.down){
					let move=moveKeys.vec2;
					if(move[0])move[1]=0;//use x axis if both pressed
					if(move[0]!=0||move[1]!=0){
						const oldPos=new Math.Vector2(this.pos);
						const newPos=new Math.Vector2(this.pos).add(move);
						const oldTile=grid[oldPos[1]][oldPos[0]];
						const newTile=grid[newPos[1]][newPos[0]];
						const moveTimeLen=0.1;//how long it takes to move 1 unit
						if(!oldTile.canLeave(this)){
							yield;//alow rest of program to run
							continue;
						}
						if(!newTile.canEnter(this)){//move some of the way and move back
							yield;
							continue;
						}else{
							for(const i of timer(moveTimeLen)){//movement animation
								this.animationPos=Math.lerp2(oldPos,newPos,i);
								yield;
							}
							this.pos=newPos;
						}
					}
					yield;
				}
				else yield;
			}
		}).bind(this)));
		//drawing player
		this.add(new MainGame.UpdateScript(l=>l.draw[10],(l,s)=>{
			this.tileSize=300/Math.max(grid[0].length,grid.length)/2;
			ctx.save();{
				ctx.translate(...Tile.screenCoords(this.animationPos));
				Draw.circle(0,0,Tile.tileSize*0.7,Draw.hslaColour(0.3,1,0.36,0.7));
			}ctx.restore();
		}));
	}
}
let timer=function*(l){
	let a=0;
	while(a<l){
		yield a/l;
		a+=MainGame.time.delta;
	}
	//return l;
};
function winGame(){
	levelEnvironmentMenu.module.add(new MainGame.UpdateScript(l=>l.draw[8],(function*(l,s){
		yield;
		//load next level
		levelEnvironmentMenu.currentLevel++;
		//if was last level, load the "completed game" animation/screen.
		if(!levelEnvironmentMenu.levels[levelEnvironmentMenu.currentLevel]){
			levelEnvironmentMenu.unload();
			levelEnvironmentMenu.loadMenu();//only load the buttons for now
			levelEnvironmentMenu.attach();
		}
		else levelEnvironmentMenu.reload();
	}).bind(levelEnvironmentMenu)).attach());
}
let grid;
let drawNormalTile=function(type="space"){
	Draw.square(0,0,1,"#333333");
	//Draw.Text({text:Level.prototype.reverseTileMap[type],size:1,align:"center",font:defaultFont})();
}
class Tile extends MainGame.UpdateModule{
	type="space";coords=[0,0];letter=".";
	;
	get tileSize(){return Tile.tileSize};
	static get tileSize(){return 300/Math.max(grid[0].length,grid.length)/2;}
	static get screenCoords(){return this.prototype.screenCoords}
	screenCoords(tileCoords){
		return tileCoords.map((v,i)=>
			(v-([grid[0].length,grid.length][i]/2|0)+0.5)*2*this.tileSize
			+Draw.center[i]
			+[0,0][i]
		);
	}
	drawScript=function(){
		drawNormalTile();
		Draw.Text({text:Level.prototype.reverseTileMap[this.type],
			size:1,align:"center",font:defaultFont})();
	}
	addDefaultDrawScript(){
		this.add(new MainGame.UpdateScript(l=>l.draw[6],(l,s)=>{
			ctx.save();{
				ctx.translate(...this.screenCoords(this.coords));
				const scale=this.tileSize*(1-3/25);
				ctx.scale(scale,scale);
				this.drawScript();
			}ctx.restore();
		}));
	}
	constructor(data,isKnownType=false){
		super([]);
		//if this type has special properties, use Tile.types to construct this
		if(data.type in Tile.types&&!isKnownType){
			return Tile.types[data.type].call(this,data);
		}
		this.addDefaultDrawScript();
		//draw tile
		Object.assign(this,data);
	}
	//using:player;
	canEnter(player){return true;}
	canLeave(player){return true;}
	// "#":"wall",
	// ".":"space",
	// "p":"player",
	// "£":"goal",
	// "d":"door", or A/B/C etc...
	// "k":"key", or a/b/c etc...
	static types={
		player(data){//coords
			player.pos=data.coords;
			return new Tile({type:"space",coords:data.coords});
		},
		wall(data){
			Object.assign(this,data);
			this.addDefaultDrawScript();
			this.canEnter=player=>false;
		},
		space(data){
			Object.assign(this,data);
			this.addDefaultDrawScript();
			this.drawScript=()=>drawNormalTile();
		},
		goal(data){
			Object.assign(this,data);
			this.addDefaultDrawScript();
			this.canEnter=player=>{player.hasWon=true;
				//When touching goal:
				//Tell player object that it has "won".
				//The player object will
				//	deal with this when it has finished moving.
				//The player will then
				return true;
			};
			this.drawScript=()=>{
				drawNormalTile();
				ctx.save();{
					ctx.translate(-0.4,0);
					const poll_width=0.2;
					const poll_length=2;
					ctx.lineWidth=0.1;
					ctx.strokeStyle="black";
					flag:{
						const flag_length=1.1;//x
						const flag_height=0.8;//y
						const distFromTop=0.05;//gap between top of poll and flag
						ctx.beginPath();
						ctx.fillStyle="green";
						ctx.rect(poll_width/2,1-poll_length+distFromTop,flag_length,flag_height);
						ctx.fill();
						ctx.stroke();
					}
					poll:{
						ctx.beginPath();
						ctx.fillStyle="grey";
						ctx.rect(-poll_width/2,1-poll_length,poll_width,poll_length);
						ctx.fill();
						ctx.stroke();
					}
				}ctx.restore();
			};
		},
		door(data){
			Object.assign(this,data);
			this.addDefaultDrawScript();
			this.isOpen=false;
			const thisLetter=this.letter.toLowerCase();
			this.canEnter=player=>{
				if(player.keys[thisLetter]>0&&!this.isOpen){
					this.isOpen=true;
					player.keys[thisLetter]--;
				}
				return this.isOpen;
			};
			let oldDrawScript=this.drawScript;
			const doorSize=[0.7,0.9];
			function drawclosedDoor(visibility){
				const extraHue=levelEnvironmentMenu.getKeyHue(thisLetter);
				const doorColour=Draw.hslaColour(0.1+extraHue,0.8,0.3,visibility);
				const borderColour=Draw.hslaColour(0.1+extraHue,0.8,0.3*0.5,visibility);
				drawDoor:{
					ctx.beginPath();
					ctx.lineWidth=0.2;
					ctx.strokeStyle=borderColour;
					ctx.fillStyle=doorColour;
					ctx.rect(-doorSize[0],-doorSize[1],doorSize[0]*2,doorSize[1]*2);
					ctx.stroke();
					ctx.fill();
					Draw.circle(0.3,0.1,0.2,"#000000");
				}
			}
			this.drawScript=()=>{
				drawNormalTile();
				let visibility;
				if(this.isOpen){
					visibility=0.7;
					ctx.save();
					let rotationVector=Math.rotate([1,0],Math.TAU*0.1,0,1);
					let vec=[doorSize[0],doorSize[1]];
					vec=vec.map(v=>v);
					ctx.translate(...vec.map(v=>-v));
					ctx.transform(
						...rotationVector,
						0,1,//...Math.rotate(rotationVector,Math.TAU*0.25,0,1),
						0,0
					);
					ctx.translate(...vec.map(v=>v));
					drawclosedDoor(visibility);
					ctx.restore();
					//Draw.Text({text:"D",size:1,font:defaultFont})();
				}else{
					visibility=1;
					drawclosedDoor(visibility);
					//Draw.Text({text:"d",size:1,font:defaultFont})();
				}
			}
		},
		key(data){
			Object.assign(this,data);
			this.addDefaultDrawScript();
			this.isPickedUp=false;
			let startTime=Number(MainGame.time);
			this.drawScript=()=>{
				let time=Number(MainGame.time)-startTime;//time in seconds
				//i have subtracted startTime to make Math.sin more accurate.
				drawNormalTile();
				//Math.TAU the ratio of a circles circumfurence to its radius.
				//Math.TAU is roughly 6.28.
				//keyColour stores colour using: [hue,saturation,brightness]
				let flashesPerSecond=1;
				let keyVisibility;
				if(this.isPickedUp){
					keyVisibility=0.3;
				}else{
					//flash while not picked up
					keyVisibility=0.8+0.1*Math.sin(flashesPerSecond*Math.TAU*time);
				}
				levelEnvironmentMenu.drawKey(0,0.5,0.08,this.letter,keyVisibility);
			}
			this.canEnter=player=>{
				if(!this.isPickedUp){
					this.isPickedUp=true;
					player.keys[this.letter]++;
				}
				return true;
			}
		},
	}
}
//scales coordinates to the size of the screen
let screenScale=([x,y])=>Draw.center.map((v,i)=>v*2*[x,y][i]);
window.levelEnvironmentMenu=new class extends Menu{
	get levels(){return Level.levels;}//stores all data about each level
	currentLevel=0;
	tilesModule=new MainGame.UpdateModule([]);
	getKeyHue(letter){//letter:string
		const keyNumber=letter.charCodeAt()-"a".charCodeAt();
		let hue=this.mapHue(keyNumber);
		return hue;
	}
	mapHue(type,num=3){
		var x = 2+(type+0.5)*2/num;
		var log =Math.pow(2,Math.floor(Math.log2(x)))
		return(((x-log)/log-0.5/num)%1);
	}
	drawKey(x=0,y=0,scale=1,keyLetter="a",alphaChannel=1){
		let keyColourList=[0.14,1,0.6];
		const keyColour=Draw.hslaColour(
			keyColourList[0]+this.getKeyHue(keyLetter),
			keyColourList[1],
			keyColourList[2],
			alphaChannel
		);
		ctx.save();{
			ctx.translate(x,y);//center the key
			ctx.scale(scale,scale);
			ctx.beginPath();
			ctx.lineWidth=2;
			ctx.strokeStyle=keyColour;
			//circle
			ctx.arc(0,-10,4,Math.TAU/4,-Math.TAU*3/4);
			//lines
			const teethLength=4;
			const rodLength=4;
			const teethGap=5;
			ctx.lineTo(0,rodLength);
			ctx.lineTo(teethLength,rodLength);
			ctx.moveTo(0,rodLength-teethGap);
			ctx.lineTo(teethLength,rodLength-teethGap);
			//ctx.closePath();
			ctx.stroke();
		}
		ctx.restore();
	}
	loadLevel(levelNumber){
		player=new Player();
		this.module.add(player);
		let level=this.levels[levelNumber];
		this.tilesModule.clear();//I trust this does not cause memory leaks
		this.module.add(this.tilesModule);
		//process string
		grid=level.startGrid
			.replaceAll(/\t/g,"")
			.match(/[^\n]+?(?=\n)/g)
			.map((v,y)=>v.match(/[\s\S]/g)
				.map((v,x)=>{
					//parse Char's
					let tile=new Tile({type:level.tileMap[v],coords:[x,y],letter:v});
					this.tilesModule.add(tile);
					return tile;
				})
			)
		;
		this.module.add(level.module);
		this.module.add(
			new MainGame.UpdateScript(l=>l.update[8],()=>{
				
			}),
		);
	}
	loadMenu(){
		this.module.add(new Button({
			text:{text:"menu"},
			pos:screenScale([0.8,0.05]),
			size:[40,20],
			parent:this,
			menu:mainMenu,
		}));
		this.module.add(new Button({
			text:{text:"levels"},
			pos:screenScale([0.7,0.05]),
			size:[40,20],
			parent:this,
			menu:levelSelectorMenu,
		}));
		let restartButton;
		this.module.add(restartButton=new Button({
			text:{text:"restart"},
			pos:screenScale([0.6,0.05]),
			size:[40,20],
			parent:this,
			menu:this,
		}));
		this.module.add(this.restart=
		new MainGame.UpdateScript(l=>l.update[8],function*(l,s){
			let key=Inputs.getKey("KeyR");
			while(!key.down){yield;}
			while(key.down){yield;}
			restartButton.onClick(restartButton);
			return true;
		}))
		this.module.add(this.dataBar=new MainGame.UpdateScript(l=>l.draw[9],()=>{
			//draws the data in the level like number of keys
			ctx.save();drawTheWholeBar:{
				const barHeight=40;
				drawTheBar:{
					ctx.fillStyle="#444444";
					ctx.lineWidth=4;
					ctx.strokeStyle="#222222";
					ctx.beginPath();
					ctx.rect(0,Draw.height,Draw.width,-barHeight);
					ctx.stroke();
					ctx.fill();
				}
				ctx.save();
				ctx.translate(//position the key display
					Draw.width*0.3,
					Draw.height-barHeight/2
				);
				for(let i=0;i<10;i++){
					let letter=String.fromCharCode("a".charCodeAt()+i);
					levelEnvironmentMenu.drawKey(0,0,1,letter);
					drawNumberOfKeys:{
						Draw.Text({
							text:":"+player.keys[letter],
							c:[7,0],//coordinates
							align:"left",
							colour:"white",
							size:20,
							font:defaultFont,
						})();
					}
					ctx.translate(40,0);
				}
				ctx.restore();
			}
			ctx.restore();
		}));
	}
	constructor(){
		super(()=>{
			this.loadMenu();
			this.loadLevel(this.currentLevel);
		});
	}
}
new MainGame.UpdateScript(l=>l.update[1],function*(){//wait for menu's to load
	yield;
	levelEnvironmentMenu.currentLevel=0;
	//levelEnvironmentMenu.reload();
	mainMenu.reload();//load the mainMenu first
	return true;//remove script
}).attach();