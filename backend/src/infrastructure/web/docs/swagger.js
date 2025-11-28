const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load the complete Swagger specification from the YAML file
const swaggerYamlPath = path.join(__dirname, '../../../../docs/api/swagger.yaml');
const swaggerSpec = yaml.load(fs.readFileSync(swaggerYamlPath, 'utf8'));

module.exports = swaggerSpec;