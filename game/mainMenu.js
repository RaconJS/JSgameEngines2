{
window.levelSelectorMenu=new class extends Menu{
	levels=[];
	latestUnlockedLevel=0;
	constructor(){
		super(()=>{
			const levels=levelEnvironmentMenu.levels;
			const width=5;
			let pos0=Math.vec2(100,100);
			for(let i in levels){
				i=+i;//convert from string to int;
				const level=levels[i];
				this.module.add(new Button({
					text:{text:i+1},
					pos:pos0.add([(i%width)*40,((i/width)|0)*40]),
					size:[20,20],
					levelNumber:i,
					onClick:this.button_onClick,
				}));
			}
			//adds the title
			this.module.add(menuNameText);
			menuNameText.detach();
			menuNameText.text="Level selector";
		});
	}
	button_draw(){

	}
	button_onClick(button){
		levelSelectorMenu.unload();
		levelEnvironmentMenu.currentLevel=button.levelNumber;
		levelEnvironmentMenu.reload();
	}
};
let menuNameText=new MainGame.UpdateModule([
	new MainGame.UpdateScript(l=>l.draw[3],()=>{
		Draw.Text({
			text:menuNameText.text,
			coords:Draw.center.map((v,i)=>v*2*[0.5,0.2][i]),
			size:30,
			colour:"black",
			font:defaultFont,
		})();
	}),
	new MainGame.UpdateScript(l=>l.draw[2],()=>{
		ctx.fillStyle="#466355";//"skyBlue";
		ctx.fillRect(0,0,Draw.width*2,Draw.height*2);
	}),
]);
window.mainMenu=new class extends Menu{
	name="main menu";
	constructor(){
		super(()=>{
			this.buttons=[
				new Button({text:{text:"start"},pos:[...Draw.center],size:[40,20],parent:this,menu:levelSelectorMenu}),
			];
			for(let i in this.buttons){
				this.module.add(this.buttons[i]);
			}
			//adds the title
			this.module.add(menuNameText);
			menuNameText.detach();
			menuNameText.text="Menu";
		});
	}
}
};