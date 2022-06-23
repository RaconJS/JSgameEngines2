"use strict";
window.MainGame=new class GameLoopEngine extends MainGame.constructor{//higher Engine
	static basic=super.constructor;
	constructor(){
		super();
		this.construct_Classes();
		this.construct_Consts();
		this.construct_Vars();
		this.construct_defaultSettings();
	}
	construct_defaultSettings(){
		this.layers={
			update:this.mainLayers.update,
			draw:this.mainLayers.draw,
			chunk:this.mainLayers.chunk,
		};
		this.updateOrder=[
			this.layers.update,
			this.layers.draw,
		];
		this.time.deltaClamp={min:1/120,max:1/15};
	}
	construct_Classes(){
		const MainGame=this;
		const searchSymbol1=Symbol();
		const searchSymbol2=Symbol();
		//version numbers are baced on bacwards compatibillity
		//V2 0.2.1 gameEngine
			const GeneratorFunction=(function*(){}).constructor;
			const ItteratorFunction=(function*(){})().constructor;
			MainGame.UpdateScript=class UpdateScriptV_1_4{//might be V_1_3 idk
				script=()=>{return false;};
				layer;
				//scriptGetter;
				//layerGetter;
				isAttached=false;//for Modules
				isDeleting=false;//deletes from gameLoop
				parent=null;//used by updateScript.bind() and the Costume subclass
				static getLayers(){return MainGame.layers;}
				constructor(getLayer,getScript,autoLoad=false,bindTo=null){
					{//argument underloading support
						//aka argument INFERENCE
						if(!(
							typeof arguments[1]=="function"//new Update(l=>l[8],(l,s)=>{do stuff})
							||(arguments[1]?.onUpdate&&arguments.length==2)//new Update(l=>l[8],OtherUpdateScript)
						)){
							//no getLayer, (()=>{do stuff})
							getScript=arguments[0];
							autoLoad=arguments[1];
							bindTo=arguments[2];
							getLayer=l=>l[l.length/2|0];
						}
						if(!["number","boolean"].includes(typeof autoLoad)){
							//no autoLoad, (()=>{do stuff},parentModule)
							bindTo=autoLoad;
							autoLoad=false;
						}
					}
					//note: getLayer=(l)=>l.update[8]
					//note: getScript=function/iterator/generator
					this.bind(bindTo);
					this.setLayer(getLayer);
					this.setScript(getScript);
					if(true){}
					else if(typeof this.script=='function'){
						this.onUpdate=function(layer,self){
							this.isDeleting=Boolean(this.script(layer,self));
							//if(returns false or 0){delete script}
						}
					}
					else if(this.script.next){//this.script instanceof ItteratorFunction){
						this.onUpdate=function(layer,self){
							this.isDeleting=this.script.next(layer,self).done;
							//if(returns false or 0){delete script}
						}
					}
					//else this.onUpdate=function(layer,i,pos)
					if(autoLoad)this.attach();
				}
				setLayer(getLayer,layers=null){
					if(layers===null)layers=this.constructor.getLayers();
					if(typeof getLayer == 'function'){
						this.layerGetter=()=>getLayer(layers);
						this.layer=getLayer(layers);
					}else{
						this.layerGetter=()=>getLayer;
						this.layer=getLayer;
					}
					return this;
				}
				setScript(getScript){
					if(this.parent)getScript=getScript?.bind?.(this.parent);
					if(getScript instanceof GeneratorFunction){
						this.scriptGetter=getScript;
						this.script=getScript(this.layer,this);
					}else{
						this.scriptGetter=()=>getScript;
						this.script=getScript;
					}
					return this;
				}
				bind(bindTo){
					this.parent=bindTo;
					if(this.parent instanceof MainGame.UpdateModule){
						this.parent.add(this);
					}
					return this;
				}
				clone(){
					let newObj=new this.constructor(this.layer,this.script,false);
					return newObj;
				}
				reload(){
					this.unload();
					this.script=this.scriptGetter();//this.setScript();
					this.layer=this.layerGetter();//this.setLayer();
					this.attach();
					return this;
				}
				unload(){
					this.detach();
					return this;
				}
				//to updateLayer
				attach(){
					//this.layer=this.getLayer(MainGame.layers);
					this.layer.add(this,false);
					this.isAttached=true;
					//this.isDeleting=false;
					return this;
				}
				detach(){
					if(this.layer)this.layer.delete(this,false);//this.deleter();
					this.isAttached=false;
					//this.isDeleting=true;
					return this;
				}
				onUpdate(updateLayer,updateScript){
					return this.runScript(updateLayer,updateScript);
				}
				runScript(updateLayer,updateScript){
					let i=this.script;
					if(!i){}
					else if(typeof i=='function')this.isDeleting=i(updateLayer,updateScript);
					else if(i.next)return this.isDeleting=i.next().done;//if(i.next()?.done);
					else if(i.onUpdate)i.onUpdate(updateLayer,updateScript);
					return this.isDeleting;
				}
				[Symbol.iterator](){
					return ;
				}
			};
			MainGame.UpdateLayer=class UpdateLayerV_1_1 extends Array{
				i=-1;
				isDeleting=false;
				constructor(length=16,onUpdate=undefined){//length/array,
					if(typeof length=='number'){
						super(length);
						for(let i=0;i<length;i++){
							this[i]=new this.constructor(0);
						}
					}
					else {
						let array=length;
						super(array.length);
						this.push(...array);
					}
					if(onUpdate)this.setScript(onUpdate);
				}
				//events
					onUpdate(){
						this.layerScript();
						return this.isDeleting;
					}
					onDelete(){
						if(this.i!=-1&&!this.isDeleting){
							this.clear();
							this.add(()=>this.onDelete(),false);
							this.isDeleting=true;
						}
						else for(let i of this){
							if(i)continue;
							else if(i.onDelete)i.onDelete();
							else if(i.return){
								i.return();
							};
							this.clear();//this.splice(0,this.length);
							//this.isDeleting=false;
						}
					}
				//item handling
					setScript(onUpdate){
						let layerScript=()=>this.layerScript();
						this.onUpdate=()=>{
							onUpdate(layerScript);
							return this.isDeleting;
						};
						return this;
					}
					add(item,returnFunction=false){
						this.push(item);
						return returnFunction?()=>this.delete(item):undefined;
					}
					set(item,newItem,returnFunction=false){
						let index=this.indexOf(item);
						if(index!=-1){
							this[index]=newItem;
						}
						return  returnFunction?()=>this.delete(newItem):undefined;
					}
					delete(item=this.i){
						let index;
						if(typeof item=='number')index=item;
						else index=this.indexOf(item);
						if(index!=-1){
							if(index>this.i){
								this.splice(index,1);
							}else{
								this[index]=undefined;
							}
							return ()=>this.add(item);
						}
						else return false;
					}
					clear(){
						this.splice(0,this.length);
					}
				*iterator(){

				}
				deleteCurrentItem(){
					this[this.i]= undefined;
				}
				layerScript(){
					if(this.isDeleting){return this.onDelete();}
					this.i=0;
					for(let i=0;i<this.length;i++){
						this.i=i;
						let item=this[i];
						let deleteScript=false;
						if(!(item==undefined||item.isDeleting)){
							if(typeof item=='function')deleteScript||=item(this,item);
							else if(item.next)deleteScript||=item.next(this,item)?.done;//if(i.next()?.done);
							else if(item.onUpdate)deleteScript||=item.onUpdate(this,item);
							if(item==undefined)deleteScript=true;
							else if(item.isDeleting){
								deleteScript=true;
							}
						}else{deleteScript=true;}
						if(deleteScript){
							this.splice(i,1);
							i--;
						}
					}
					this.i=-1;
				}
				UpdateScript(scriptFunc){
					this(scriptFunc);
				}
			};
			MainGame.UpdateModule=class UpdateModuleV_1_0 extends Set{
				//add,delete,size,for(i of this)
				//get length(){return this.size};
				//INFERENCE: no onload => isStatic => unload() does not clear() this.
				constructor(activeScripts=[],onload,deload){
					super(activeScripts);
					if(onload)this.onload=onload;
					if(deload)this.deload=deload;
				}
				//customFunctions:
				//  onload:()=>{construct/add objects}
				//  deload:()=>{remove extra refrences}
				//add
				//delete
				get length(){return this.size}
				clear(){Set.prototype.clear.call(this,);return this;}
				add(...components){
					for(let part of components)Set.prototype.add.call(this,part);return this;
				}
				delete(...components){
					for(let part of components)Set.prototype.delete.call(this,part);return this;
				}
				addTo(module){module.add(this);return this}
				deleteFrom(module){module.delete(this);return this}
				get #isStatic(){return !this.onload}//true -> preserve parts when unload() is called.
				reload(){
					if(searchSymbol1 in this)return this;
					this[searchSymbol1]=1;
					{
						this.unload?.();
						if(!this.#isStatic){
							this.onload();
							this.parent?.add?.(this);
						};
						for(let i of this){i.reload?.();}
					}
					delete this[searchSymbol1];
					return this;
				}
				unload(){
					if(searchSymbol2 in this)return this;
					this[searchSymbol2]=1;
					{
						for(let i of this){i.unload?.();}
						if(!this.#isStatic){
							this.parent?.delete?.(this);
							this.clear();
						}
						this.deload?.();
					}
					delete this[searchSymbol2];
					return this;
				}
				setParent(newParent){
					if(this.parent){
						this.parent.delete(this);
					}
					{
						newParent.add(this);
						this.parent=newParent;
					}
					return this;
				}
				parent=undefined;//:UpdateModule

				parse(){for(let i of this){MainGame.makeScripts([i],this)[0];}return this;}
				//attach/detach are OBSOLETE
				attach(){
					if(searchSymbol1 in this)return this;
					this[searchSymbol1]=1;
					{
						for(let i of this){i.attach?.();}
					}
					delete this[searchSymbol1];
					return this;
				}
				detach(){
					if(searchSymbol2 in this)return this;
					this[searchSymbol2]=1;
					{
						for(let i of this){i.detach?.();}
					}
					delete this[searchSymbol2];
					return this;
				}
				mergeWith(module2){
					for(let i in module2){
						this.add(module2[i]);
					}
				}
				makeScripts(scripts,sprite=this){
					return this.constructor.makeScripts(scripts,sprite,this);
				}
				addScripts(){//unfinished
				}
				static makeScripts=function(scripts,sprite=scripts,refModule=undefined){
					let newModule=refModule??new MainGame.UpdateModule();
					for(let i in scripts){
						if(scripts.hasOwnProperty(i)){
							let s=MainGame.makeScript(scripts[i],sprite);
							newModule[i]=s;
							newModule.add(s);
						}
					}
					return newModule;
				};
			};
			MainGame.makeScripts=function makeScriptsV_1_0(scripts,sprite=scripts){
				for(let i in scripts){
					if(scripts.hasOwnProperty(i)){
						let s=this.makeScript(scripts[i],sprite);
						scripts[i]=s;
					}
				}
				return scripts;
			};
			MainGame.makeScript=function makeScriptV_1_0(script,sprite=null){
				let s=script;
				if(s.onUpdate){//i.e. s instanceof UpdateScript||UpdateLayer 
					return s;
				}
				else{
					let s1=s instanceof Array?[s[0],s[1],s[2]]:
					typeof s=='object'?[s.layer??(l=>l.update[(l.update.length*0.4)|0]),s.script,s.attach]:0;
					if(s1==0)return s;
					return new MainGame.UpdateScript(s1[0],sprite?s1[1].bind(sprite):s1[1],s1[2]);
				}
			}
	}
	construct_Consts(){
		this.time=new Time();
		this.mainLayers={
			update:new this.UpdateLayer(20),
			draw:new this.UpdateLayer(20),
			chunk:new this.UpdateLayer(4),//for storing sprites
		}
		this.mainLayers.update.onUpdate=function(){//default function
			this.layerScript();
		};
		this.mainLayers.draw.parent=this;
		this.mainLayers.draw.onUpdate=function(){
			Draw.clear();
			this.layerScript();
			const time=this.parent.time;
			time.startLoop();
			time.realDelta=time.delta;
			time.delta=Math.clamp(time.deltaClamp.min,time.deltaClamp.max,time.delta);
		};
		this.mainLayers.chunk.onUpdate=function(){
			this.layerScript();
		};
	}
	construct_Vars(){
		this.layers={};
		this.updateOrder=[];
		this.menuLayers={};//not yet used by MainGame class
	}
};
{//nameSpaces: Update,Draw,Input,ctx,
	window.Update=class Update extends MainGame.UpdateScript{
		static getLayers(){return MainGame.layers.update;}
	};
	window.Costume=class Draw extends MainGame.UpdateScript{
		#coords=Math.Vector2?new Math.Vector2():[0,0];
		get coords(){return this.#coords}
		set coords(v){this.#coords=v}
		#matrix=Math.Matrix2x2?new Math.Matrix2x2():[[1,0],[0,1]];
		get matrix(){return this.#coords}
		set matrix(v){this.#coords=v}
		onUpdate(l,s){
			ctx.save();
			if(this.parent){
				if("coords" in this.parent)this.#coords=this.parent.coords;
				if("matrix" in this.parent)this.#matrix=this.parent.matrix;
			}
			if(!!this.#coords)ctx.translate(...this.#coords);
			if(!!this.#matrix)ctx.transform(...this.#matrix.flat(),0,0);
			let ret=this.runScript(l,s);
			ctx.restore();
			return ret;
		}
		static getLayers(){return MainGame.layers.draw;}
	};
	window.Module=class Module extends MainGame.UpdateModule{};
	window.Layer=class Layer extends MainGame.UpdateLayer{};
	window.Input=Inputs;
};