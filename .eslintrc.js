module.exports = {
	"env": {
        "browser": true
    },
	"globals": {
		"d3":true,
		"$":true,
		"contents": true	
	},
	"extends": "airbnb",
	"rules": {
		"no-param-reassign": 0,
		"no-use-before-define": ["error", { "functions": false, "classes": true }]
	},
	"plugins": [
	"react",
	"jsx-a11y",
	"import"
	]
};