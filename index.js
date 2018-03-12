import Vue from 'vue';

import line from './line'
import bar from './bar'
import radar from './radar'
import pie from './pie'
import doughnut from './doughnut'
const components=[
	line,
	pie,
	doughnut,
	radar,
	bar
]

export default  (Vue,options)=>{
	components.map(component => {
		Vue.component(component.name, component);
	});
}

export {
	line,
	pie,
	doughnut,
	radar,
	bar
}