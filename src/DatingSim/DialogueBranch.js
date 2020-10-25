export default class DialogueBranch{
	constructor(texts){
		this.texts = texts
	}

	* showNext(manager){
		for(let i=0; i< this.texts.length; i++){
			let {speaker, body, choices} = this.texts[i]
			let message = `${speaker}:\n${body}`
			console.log(message)
			if(choices){
				choices.forEach((c)=>{
					console.log(body)
				})
			}
			yield message
		}
	}
}