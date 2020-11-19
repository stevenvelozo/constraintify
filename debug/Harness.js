let libConstraintify = require('../source/Constraintify.js');

let _RecipeGraph = new libConstraintify();

_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Bread','Ingredient','Flour');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Bread','Ingredient','Salt');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Bread','Ingredient','Sugar');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Bread','Ingredient','Yeast');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Pancake','Ingredient','Flour');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Pancake','Ingredient','Egg');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Pancake','Ingredient','Milk');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Cereal','Ingredient','Oats');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Cereal','Ingredient','Milk');
_RecipeGraph.addSetValueConnectionBidirectional('Recipe','Cereal','Ingredient','Sugar');
_RecipeGraph.addSetValueConnectionBidirectional('Storage','Fridge','Ingredient','Milk');
_RecipeGraph.addSetValueConnectionBidirectional('Storage','Fridge','Ingredient','Egg');
_RecipeGraph.addSetValueConnectionBidirectional('Storage','Pantry','Ingredient','Flour');
_RecipeGraph.addSetValueConnectionBidirectional('Storage','Pantry','Ingredient','Oats');
_RecipeGraph.addSetValueConnectionBidirectional('Storage','Pantry','Ingredient','Sugar');
_RecipeGraph.addSetValueConnectionBidirectional('Storage','Pantry','Ingredient','Yeast');

console.log('-------- -------- --------')
console.log('Recipe: '+JSON.stringify(_RecipeGraph.getSetValues('Recipe')));
console.log('-------- -------- --------')
console.log('Storage: '+JSON.stringify(_RecipeGraph.getSetValues('Storage')));
console.log('-------- -------- --------')
console.log('Storage.Pantry.Ingredient: '+JSON.stringify(_RecipeGraph.getSetConnectedValues('Storage','Pantry','Ingredient')));
console.log('-------- -------- --------')
console.log('Ingredient: '+JSON.stringify(_RecipeGraph.getSetValues('Ingredient')));
console.log('-------- -------- --------')
console.log('Storage.Pantry has Ingredient.Yeast: '+_RecipeGraph.checkSetConnectedValue('Storage','Pantry','Ingredient','Yeast'));
console.log('Storage.Pantry has Ingredient.Egg: '+_RecipeGraph.checkSetConnectedValue('Storage','Pantry','Ingredient','Egg'));
