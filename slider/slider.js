/**
 * @class Slider
 * @property  {string} containerId
 * @property  {string} slideTemplateId
 * @property  {number} slideToShow
 * @property  {HTMLDivElement} container
 * @property 	{object} data
 * @property 	{object} data.pagination
 * @property 	{number} data.pagination.total
 * @property 	{number} data.pagination.bench
 * @property 	{string} data.pagination.filter
 * @property 	{number} data.pagination.benchSize
 * @property 	{{name: string; gender: string; age: string; profession: string}[]} data.items
 */
class Slider {

	requestUrl = null;
	currentStep = 1;
	get canLoad(){
		return (this.data.items.length < this.data.pagination.total);
	}

	get maxStep(){
		return (Math.round(this.data.items.length / this.slideToShow));
	}

	get initBenchReqData() {
		return {
			pagination: {
				bench: 1,
				filter: this.data.pagination.filter,
				benchSize: this.data.pagination.benchSize
			}
		}
	}

	get nextBenchReqData() {
		return {
			pagination: {
				bench: (this.data.pagination.bench + 1),
				filter: this.data.pagination.filter,
				benchSize: this.data.pagination.benchSize
			}
		}
	}

	/**
	 *
	 * @param {object} data
	 * @param {string} data.requestUrl
	 * @param {string} data.containerId
	 * @param {number} data.slideToShow
	 * @param {string} data.slideTemplateId
	 * @param {object} data.data
	 * @param {object} data.data.pagination
	 * @param {number} data.data.pagination.total
	 * @param {number} data.data.pagination.bench
	 * @param {string} data.data.pagination.filter
	 * @param {number} data.data.pagination.benchSize
	 * @param {{name: string; gender: string; age: string; profession: string}[]} data.data.items
	 */
	constructor (data) {
		this.data = data.data;
		this.requestUrl = data.requestUrl;
		this.slideToShow = data.slideToShow;
		this.containerId = data.containerId;
		this.slideTemplateId = data.slideTemplateId;
		this.container = document.getElementById(this.containerId);
		this.slideTemplate = document.getElementById(this.slideTemplateId);
	}

	/**
	 *
	 * @param {object} slideData
	 * @param {string} slideData.age
	 * @param {string} slideData.name
	 * @param {string} slideData.gender
	 * @param {string} slideData.profession
	 */
	renderTemplate(slideData){
		const temp = this.slideTemplate.content.cloneNode(true);
		Object.keys(slideData).map((key) => {
			temp.querySelector(`.slide .slide__${key} .data`).innerText = slideData[key];
		});
		return temp;
	}

	renderData(data){
		data.forEach((item) => {
			const temp = this.renderTemplate(item);
			this.container.append(temp);
		});
	}

	render(){
		this.container.style.transform = `translateX(0%)`;
		this.container.innerHTML = '';
		this.renderData(this.data.items);
	}

	setFilter(ev, filter){
		if (this.data.pagination.filter === filter) return;
		this.changeActiveBtn(ev);
		this.data.pagination.bench = 1;
		this.data.pagination.filter = filter;
		this.loadData(this.initBenchReqData)
	}

	next(){
		const nextStep = this.currentStep + 1;
		if(nextStep <= this.maxStep) {
			const transform = (nextStep - 1) * 100
			this.container.style.transform = `translateX(-${transform}%)`;
			this.currentStep = nextStep;
		}

		if(this.canLoad){
			this.loadData(this.nextBenchReqData)
		}
	}

	prev(){
		const prevStep = this.currentStep - 1;
		if(prevStep > 0) {
			const transform = (prevStep - 1) * 100
			this.container.style.transform = `translateX(-${transform}%)`;
			this.currentStep = prevStep;
		}
	}

	async post(data) {
		try {
			const response = await fetch(this.requestUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Error:", error);
		}
	}

	/**
	 *
	 * @param {object | undefined} data
	 * @param {string | undefined} data.filter
	 * @param {object} data.pagination
	 * @param {number} data.pagination.bench
	 * @param {number} data.pagination.benchSize
	 */
	loadData(data = undefined){
		this.post(data).then((res) => { this.onDataLoaded(res); });
	}

	/**
	 *
	 * @param {object} res
	 * @param {object} res.pagination
	 * @param {number} res.pagination.total
	 * @param {number} res.pagination.bench
	 * @param {string} res.pagination.filter
	 * @param {number} res.pagination.benchSize
	 * @param {{name: string; gender: string; age: string; profession: string}[]} res.items
	 */
	onDataLoaded(res){
		if (res.pagination.bench == 1){
			this.currentStep = 1
			this.data = res;
			this.render();
		} else {
			this.data.items = this.data.items.concat(res.items);
			this.data.pagination = res.pagination;
			this.renderData(res.items);
		}
	}

	/**
	 *
	 * @param {HTMLAnchorElement} btn
	 */
	changeActiveBtn(btn){
		btn.parentNode.childNodes
				.forEach((node) => {
					if (node.nodeName === 'A'){
						node.classList.remove('active');
					}
				});
		btn.classList.add('active');
	}
}
