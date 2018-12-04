export default class WebWorker {
	constructor(worker) {
        const code = worker.toString();
        const src = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))
        const blob = new Blob([src], { type: 'application/javascript' })
		return new Worker(URL.createObjectURL(blob));
	}
}
