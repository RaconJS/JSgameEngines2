class Camera extends Costume{
	//coords;
	#coords=[0,0];
	get coords(){return this.#coords}
	set coords(v){this.#coords=v}
	constructor(layerGetter){
		super(d=>d[8],new Layer(16,(layerScript)=>{
			ctx.translate(...Draw.center);
			ctx.save();{
				ctx.translate(...this.coords.map(v=>-v));
				layerScript();
			}ctx.restore();
			Draw.line(0,10,0,-10,2,"blue")
		}));
	}
	SceneDraw=class SceneDraw extends Costume{
		static getLayers(){return camera.script}
	}
}
window.camera=new Camera;
class SceneDraw extends camera.SceneDraw{};
class DE{coords;length;normal;constructor(data){Object.assign(this,data)}}
class Rect extends Module{
	size=Math.vec2([0,0]);//diameter
	coords=Math.vec2([0,0]);
	constructor(p1,p2,colour,matrix){
		super();
		Object.assign(this,{
			p1,p2,colour,
			matrix:Math.mat2(matrix??[[1,0],[0,1]])
		});
		this.setPos(p1,p2);
	}
	setPos(p1,p2){
		this.coords=p1.map((v,i)=>(p1[i]+p2[i])/2);
		this.size=p1.map((v,i)=>Math.abs(p2[i]-p1[i]));
	}
	onload(){
		this.add(new SceneDraw(l=>l[5],(l,s)=>{
			ctx.fillStyle=this.colour;
			ctx.fillRect(...this.coords.map((v,i)=>v-this.size[i]/2),this.size,1);
		}));
	}
	DE(coords){//:vec2->length
		let dif=coords.map((v,i)=>v-this.coords[i]);
		let normal=dif.map(v=>[1,-1][+(v<0)]);
		dif=dif.map((v,i)=>Math.max(0,Math.abs(v)-this.size[i]/2));
		normal=normal.map((v,i)=>v*(dif[i]>0));
		let dist=Math.hypot(...dif);
		return new DE({length:dist,coords:dif,normal});
	}
};
class Player extends Module{
	camera;
	onload(){
		this.coords=[200,50];
		this.add(this.camera);
		this.add(new Update(l=>l[8],this.main.bind(this)));
		this.add(new SceneDraw(l=>l[8],this.mainDraw.bind(this)));
		this.add(new Update(l=>l[8],this.followCam.bind(this)));
	}
	moveSpeed=200;
	mainDraw(){
		ctx.save();
		ctx.translate(...this.coords);
		Draw.circle(0,0,10,"blue");
		ctx.restore();
	}
	*main(){
		while(true){
			let moveVec2=Math.vec2(Inputs.getKey("KeysWASD").vec2);
			moveVec2.set(moveVec2.scale(1/Math.max(1,Math.hypot(...moveVec2))))
			this.coords=this.coords.map(
				(v,i)=>v+moveVec2[i]*this.moveSpeed*MainGame.time.delta
			);
			yield;
		}
	}
	moveBy(vec){
		for(let i of rects){

		}
	}
	followCam(){
		this.camera.coords=Math.lerpT2(this.camera.coords,this.coords,0.9,MainGame.time.delta);
	}
	deload(){}
}
window.player=new Player;
player.camera=camera;
player.reload();
window.rects=new Module([
	new Rect([0,0],[40,100],"green").reload(),
],).attach();
Object.assign(rects,{
	collision:class collision extends Module{
		constructor(parent,type="capsule"){
			super();
			this.parent=parent;
		}
		DE(a,b){

		}
		onload(){
			this.add(new Update(()=>{
				let self=this.parent;
				if(1||this.type=="capsule")
				for(const rect of rects){
					
				}
				else{}
			}));
		};
	},
})
new Module([],function(){this.add(
	new Update(()=>{
		let t=MainGame.time;
		this.coords=Math.rotate([0,0],t*Math.TAU/2,0,1);
	}),
	new SceneDraw(()=>{
		Draw.circle(...this.coords,10,"red");
	}),
)}).reload();
new MainGame.UpdateScript(l=>l.draw[8],()=>{/*do stuff*/}).attach();
new Costume(()=>{/*do stuff*/}).reload();
MainGame.start();
(new class extends Module{
	coords=[100,40];
	size=20;
	mainUpdate=new Update(function*(layer,script){
		while(true){
			yield;
		}
	},this);
	mainDraw=new SceneDraw((layer,script)=>{//draws a circle at (x:100,y:40) - camera possision
		Draw.circle(0,0,this.size,"#37FF3760");
		return false;//endScript = false
	},this);
}).reload();