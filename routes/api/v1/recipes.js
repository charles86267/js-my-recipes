
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const recipesPath = path.join(__dirname, '../../../data/recipes.json');
let recipes = require(recipesPath);

router.get('/', (_, response) => {
    const recipesResult = recipes.map(({ 
        id, 
        title, 
        image, 
        prepTime, 
        difficulty 
    }) => ({ id, title, image, prepTime, difficulty }));
    
    response.json(recipesResult);
});

router.get('/recipe/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const recipe = recipes.find(recipe => recipe.id === id);
    
    if (recipe) {
        return response.json(recipe);
    }
    response.status(404).json({ error: `Recipe with ID ${id} not found` });
});

router.post('/recipe/add', (request, response) => {
    const newRecipe = request.body;
    
    const requiredFields = [
        'title', 
        'image', 
        'ingredients', 
        'instructions', 
        'prepTime', 
        'difficulty'
    ];
    const missingFields = requiredFields.filter(field => !newRecipe[field]);
    
    if (missingFields.length > 0) {
        return response.status(400).json({
            error: true,
            message: `Missing required fields: ${missingFields.join(', ')}`
        });
    }
    
    newRecipe.id = recipes.length + 1;
    
    recipes.push(newRecipe);
    
    try {
        fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2));
    } catch (error) {
        return response.status(500).json({
            error: true,
            message: 'Failed to save recipe'
        });
    }
    
    response.status(201).json(newRecipe);
});

module.exports = router;