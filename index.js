// Rakesh M R
const fs = require('fs');
const config = require('./config.json');
let error_vars = [];
let checked_vars = [];

function check_all_keys(object) {
	var isArray = Array.isArray(object);
    for (let key in object) {
        let value = object[key];
        if (typeof value != "object") { 
            let regex = false, length = false, mandate = false;
            if (typeof value == "string" && config[key]) {
            	checked_vars.push(key);
            	let regexExp = new RegExp(`${config[key].regex}`);
            	let varError = [];
            	if (!regexExp.test(value)) {
            		regex = true;
            		varError.push('Regex match failed');
            	}
            	if (!(parseInt(value.length) >= parseInt(config[key].min))) {
            		length = true;
            		varError.push(`${value.length} is less than min(${config[key].min})`);
            	}
            	if (!(parseInt(value.length) <= parseInt(config[key].max))) {
            		length = true;
            		varError.push(`${value.length} is more than max(${config[key].max})`);
            	}
            	if (regex || length) {
            		let var_data = `{ "${key}": {"text": "${value}", "error": "${varError}"}}`
            		error_vars.push(JSON.parse(var_data));
            	}
            }
        } else { 
            newValue = check_all_keys(value);
        }
    }
    return true;
}

function get_final_score() {
	let final_score = {};
	let missing_vars = [];
	if(parseInt(checked_vars.length) == parseInt(Object.keys(config).length)) {
		missing_vars = [];
	} else {
		for(let key in config) {
			if (!checked_vars.includes(key) && config[key].mandate === true) {
				missing_vars.push(key);
			}
		}
	}
	const risk_score = ((missing_vars.length + error_vars.length) / parseInt(Object.keys(config).length))*100;
	return {final_score: {risk_score: risk_score}, missing_vars: missing_vars};
}

async function main() {
	const data_file_json = '608.json';
	const data_folder = './data_json/';
	const data = require(`${data_folder}${data_file_json}`);
	await check_all_keys(data);
	const score = await get_final_score();
	console.log(`Final risk score: ${(score.final_score.risk_score).toFixed(2)}%`);
	// Error Vars
	if (error_vars.length > 0) {
		console.log('-------------------------------------\nError Varibales\n');
		for (error in error_vars) {
			console.log(`${JSON.stringify(error_vars[error])}`);
		}
	} else {
		console.log(`-------------------------------------\nNo error Values\n`);
	}
	// Missing Vars
	if (score.missing_vars.length > 0) {
		console.log('-------------------------------------\nMissed Varibales\n');
		for (missed in score.missing_vars) {
			console.log(`${score.missing_vars[missed]}`);
		}
	} else {
		console.log(`-------------------------------------\nNo variable missed\n`);
	}
}

main();