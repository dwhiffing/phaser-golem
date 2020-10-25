import { default as DialogueBranch } from './DialogueBranch'

export default class DialogueState{
	constructor(){
		this.registry = {}
		this.currentBranch = null
	}

	goTo(label){
		this.currentBranch = new DialogueBranch(this.registry[label])
	}
}