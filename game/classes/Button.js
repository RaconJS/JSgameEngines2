class Button{
	constructor(args={}){
		//possible arguments:
		//{pos,size,cols,text,shape}
		//{menu,parent} //references
		//{onClick,onOver,onDown} //events
		//{drawScript} //scripts
		for(let i in args){
			if(args[i]!=undefined){
				if(i=="pos"||i=="size"){
					this[i]=Math.vec2(args[i]);
				}
				else this[i]=args[i];
			}
		}
		this.detach();
		this.module.add(this.drawScript);
	}
	module=new MainGame.UpdateModule([]);
	click(){};
	detach(){
		Button.buttons.delete(this);
		this.module.detach();
		return this;
	}
	attach(){
		Button.buttons.add(this);
		this.module.attach();
		return this;
	}
	draw(){

	}
	onDown=(newState=false,self)=>{};
	onOver=(newState=false,self)=>{};
	menu;//={reload(){}}
	parent;//={unload(){}};
	onClick=(self)=>{
		self.parent.unload();
		self.menu.reload();
	};
	pos=Math.vec2(0,0);//center of button;
	size=Math.vec2(10,10);//radius around pos;
	shape="rectangle";
	cols=["darkGrey","lightGrey","grey"];
	drawScript=new MainGame.UpdateScript(l=>l.draw[10],()=>{
		ctx.save();{//ctx = 2D canvas context. its something used for drawing.
			let t=MainGame.time.start;//time at start of gameLoop in seconds
			let colour=this.cols[0];
			if(this.isMouseOver){
				colour=this.cols[1];
				if(this.isMouseDown){
					colour=this.cols[2];
				}
			}
			switch(this.shape){
				default:{
					let halfSize=this.size.map(v=>v/2);
					ctx.fillStyle=colour;
					ctx.fillRect(
						...this.pos.sub(halfSize),
						...this.size
					);
				}
			}
			if(typeof this.text=="string")throw "type error: new Button().text should be an instance of Draw.Text";
			ctx.translate(...this.pos);
			if(this.text!=undefined)Draw.Text(
				{c:[0,0],align:"center",colour:"white",font:defaultFont,...this.text}
			)();
		}ctx.restore();
	});
	isMouseDown=false;
	wasMouseDown=false;
	isMouseOver=false;
	wasMouseOver=false;
	static buttons=new Set([]);
	static init(){
		let isStart=true;
		new MainGame.UpdateScript(l=>l.update[4],()=>{
			//ignore the first frame
			//the mouse coordinates might need a frame to start working.
			if(isStart){isStart=false;return false;}
			let isMouseDown=Inputs.mouse.down;
			let mousePos=Math.vec2(Inputs.mouse.vec2);
			for(let button of this.buttons){
				button.wasMouseDown=button.isMouseDown;
				button.wasMouseOver=button.isMouseOver;
				button.isMouseDown=isMouseDown;
				//posDif is a vector from button to the mouse
				let posDif=mousePos.sub(button.pos);
				switch(button.shape){
					default:{//rectangle collider
						button.isMouseOver=
							Math.abs(posDif[0])<button.size[0]/2&&
							Math.abs(posDif[1])<button.size[1]/2
						;
					}
				}
				//enter,mouseDown,exit,mouseUp => click;
				//enter,mouseDown,mouseUp => click;
				if(button.isMouseOver!=button.wasMouseOver){
					if(
						(!button.isMouseOver)
						||(button.isMouseOver&&!button.wasMouseDown)
					)
					button.onOver(button.isMouseOver,this);
					else button.isMouseOver=button.wasMouseOver;
				}
				if(button.isMouseDown!=button.wasMouseDown){
					if(1
						//(!button.isMouseDown&&button.isMouseOver)
						//||(button.isMouseDown&&button.isMouseOver)
					){
						button.onDown(button.isMouseDown,this);
					}else button.isMouseDown=button.wasMouseDown;
					if(!button.isMouseDown&&button.wasMouseOver){
						button.onClick(button);
					}
				}
			}
		}).attach();
	}
	static module;
};
Button.init();//set up scripts for Button