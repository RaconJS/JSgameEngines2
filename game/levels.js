// "#":"wall",
// ".":"space",
// "p":"player",
// "£":"goal",
// "d":"door",
// "k":"key",
//TODO: multicolour keys, using 'keys->abc' and 'doors->ABC'
Level.levels=[
	new Level(//0
		"basic mechanics",//introducing movement
		`
			#########
			#...£...#
			#.......#
			#.......#
			#.......#
			#.......#
			#...p...#
			#########
		`,({module})=>{
			module.add(new MainGame.UpdateScript(l=>l.draw[9],(l,s)=>{
				ctx.save();{//draw text
					//scale to sizes relative to screen 
					const scale=(x,y)=>[x,y].map((v,i)=>(v+1)*Draw.center[i]);
					ctx.translate(...scale(-1,-0.8));
					for(const text of [
						"Use the arrow keys",
						" to move.",
						"",
						"Reach the green",
						"flag to win",
					]){
						Draw.Text({text,size:20,align:"left",font:"comic-sans"})();
						ctx.translate(0,20);
					}
				}ctx.restore();
			}));
		}
	),new Level(//1
		"introducing walls",
		`
			#########
			#.......#
			#..#....#
			#.£#.####
			####....#
			#.......#
			#...p...#
			#########
		`,
	),new Level(//2
		"introducing door and key",
		`
			#########
			#...£...#
			#.......#
			####A####
			#.......#
			#.....a.#
			#...p...#
			#########
		`,
	),new Level(//3
		"abstrction",
		`
			##########
			#£#..a...#
			#.#......#
			#A####A###
			#........#
			#........#
			#...p.a..#
			##########
		`,
	),
	//WIP levels
	new Level(//4
		"first good level",
		`
			abcdefghi
			ABCDEFGHI
			#########
			#£A.A#aa#
			####.#Aa#
			#..#.#.##
			#.##A#A##
			#.aa.#.a#
			####A#A##
			#a..p...#
			#########
		`,
	),new Level(//5
		"multiple pathes",
		`
			#########
			####£####
			#..AA.###
			#.###Aa##
			#aa#A.a##
			##A#.####
			#a..p...#
			#########
		`,
	),new Level(//6
		"introducing colour",
		`
			#########
			#.a#£#.c#
			#..#.#..#
			#C##A##B#
			#...p...#
			#.......#
			#b......#
			#########
		`,
	),new Level(//7
		"decomposision 1",
		`

			#########
			#b...B.£#
			#....#C##
			#..###.c#
			#.A.a.A.#
			####C####
			##c#.#..#
			#bB.B.a.#
			#..#b#..#
			#A#####A#
			#.......#
			#p..a...#
			#.......#
			#########
		`,
	),new Level(//8
		"decomposision 2",
		`

			###########
			#..#£#....#
			#..#E#..e##
			##.#A###c.#
			#c#..#e#.C#
			#B#E##.##.#
			#..BC..C.c#
			#b#..####B#
			#.#ba#.b..#
			#A####A####
			#.........#
			#p..aa....#
			###########
		`,
	),new Level(//
		"empty level",
		`
			#########
			#...£...#
			#.......#
			#.......#
			#.......#
			#.......#
			#p......#
			#########
		`,
	),
];