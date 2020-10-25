import { default as DialogueState } from '../DatingSim/DialogueState'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'TextGame' })
  }

  create(){
  	this.state = new DialogueState()
	this.state.registry['spoop'] = [
		{ 
			speaker: 'Sis',
			body: "Step-bro I need help with my homework",
		},
		{
			speaker: 'Bro',
			body: "I'm leaving get me out of here"
		},
		{
			speaker: 'Sis',
			body: "uwu"
		}
	]

	// this.state.registry['not_spoop'] = [
	// 	{ 
	// 		speaker: 'Herb',
	// 		body: "That wasn't so bad",
	// 	}
	// ]

	// this.state.registry['favourite_food'] = [
	// 	{
	// 		speaker:'George Martinez', 
	// 		body: 'What is your favourite food',
	// 		choices: [
	// 			{
	// 				body: 'Hotdog',
	// 				callback: (manager) =>{
	// 					// Dispatch as events probably
	// 					// +inventory
	// 					// +stats
	// 					// transition to other dialogue state
	// 					manager.goTo('spoop')
	// 				}
	// 			},
	// 			{
	// 				body: 'Peanut',
	// 				callback: (manager) =>{
	// 					manager.goTo('spoop')
	// 				} 
	// 			},
	// 			{
	// 				body: 'Pancake',
	// 				callback: (manager) =>{
	// 					manager.goTo('not_spoop')
	// 				} 
	// 			}
	// 		]
	// 	},
	// ]

	this.state.goTo('spoop')
	this.currText = this.state.currentBranch.showNext()
	this.displayedText = this.add.text(0,0, this.currText.next().value, {font: '10px', wordWrap: {width: 100, useAdvancedWrap: true}})
	this.input.on('pointerdown', (pointer) => {
  		if(this.displayedText){
  			this.displayedText.destroy()
  		}
  		this.displayedText = this.add.text(0,0, this.currText.next().value, {font: '10px', wordWrap: {width: 100, useAdvancedWrap: true}})
	})
  }
}
