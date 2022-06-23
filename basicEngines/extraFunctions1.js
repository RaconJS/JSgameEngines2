"use strict";
function loga(log="",alertText=""){
    console.error(log);
    alert(alertText);
};
var loadLog;
async function importJavascriptFromSrc(...sources){
    // Adds the scripts at sources to the webpage by
    // adding them to the body as inline script elements.
	let scripts={},src,script;
	await new Promise((resolve,reject)=>{
		let itter=function* importFromSource(){
			for(const source of sources){
				src=importJavascriptFromSrc.baseSrc+source;
				script=document.createElement('SCRIPT');
				script.onload=function(){
					itter.next();
				}
				script.src=src;
				document.body.appendChild(script);
				scripts[src]=script;
				yield script;
			}
			resolve();
		}();
		itter.next();
	});

	return scripts;
};
importJavascriptFromSrc.baseSrc="";
function classToFunction(classObj,constructor=null){
	let obj={
		[classObj.name]:constructor??function(...args){
			return new classObj(...args);
		},
	};
	obj[classObj.name];//.bind(obj);
	let newFunction=obj[classObj.name];
	Object.defineProperties(newFunction,Object.getOwnPropertyDescriptors(classObj));
	newFunction.prototype.constructor=newFunction;
	return newFunction;
};
function fastSet(arry){//not finished
	//can only store objects.
	this.array=arry;
	this.indexSymbol=Symbol("index");
	return 
};fastSet.prototype={
	...fastSet.prototype,
	get set(){

	},
	add(item){
		if(indexSymbol in item&&item[indexSymbol]!=-1){
			item[indexSymbol]=this.array.length;
			this.array.push(item);
		}
		return this;
	},
	clear(){
		for(let i=0;i<this.array.length;i++){
			
		}
	},
	delete(){},
};
var globalEval=(exp)=>eval(exp);
function setAnimationLoop(loopFunc){
	let end=false;
	let endLoop=()=>end=true;
	return (async function(loopFunc){
		while(!end){
			await new Promise((resolve,reject)=>{
				requestAnimationFrame(()=>{
					loopFunc(endLoop);
					resolve();
				});
			});
		}
		return this;
	}());
}