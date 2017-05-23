//This iControlLX Extension will run pre-installed POSTMAN collections.
var logger = require('f5-logger').getInstance();
var newman = require('newman');   //Node library that runs POSTMAN collections
var workflows = require('./workflows.json');  //Obtain workflows from workflows.json

// Constructor
function festivus() {
}

// Declare worker path
festivus.prototype.WORKER_URI_PATH = "shared/festivus";

// Attribute declares worker is public and visible off box
festivus.prototype.isPublic = true;

festivus.prototype.onStart = function(success, error) {

  logger.info("festivus onStart()...\tReading workflows...");

//Print out the workflows to show it loaded fine
  for (var i in workflows.items) {
    logger.info('Workflow found: ' +workflows.items[i].name);
  }

  this.state = workflows;
  success();
};

/**
 * handle onGet HTTP request
 */
festivus.prototype.onGet = function(restOperation) {
  logger.info("GET " +this.WORKER_URI_PATH);
  restOperation.setBody(this.state);
  this.completeRestOperation(restOperation);
};

/**
 * handle onPost HTTP request
 */
festivus.prototype.onPost = function(restOperation) {
  var newState = restOperation.getBody();

  logger.info('workflow_file: ' +newState.workflow_file);
  logger.info('action: ' +newState.action);
  logger.info('environment: ' +JSON.stringify(newState.environment,' ', '\t'));

// Is this new settings or is it from the iWorkflow subscription
  if (typeof newState.action !==  'undefined' && newState.action) {
    if (newState.action == 'execute') {
      newman.run({
        collection: require('./workflows/' +newState.workflow_file),
        environment: newState.environment,
        reporters: 'cli',
        insecure: true
      })
      .on('done', function (err, done) {
        if (err) {
          logger.info('No festivus for anyovus: ' +err);
          restOperation.setBody(err);
          festivus.prototype.completeRestOperation(restOperation);
        }
        else {
//          logger.finest('newman.run.on.done - summary: ' +JSON.stringify(done, ' ', '\t'));
          logger.info('A \'festivus\' for the restivus....');
          restOperation.setBody(done);
          festivus.prototype.completeRestOperation(restOperation);
        }
      });
    }
  }
};

/**
 * handle /example HTTP request
 */
festivus.prototype.getExampleState = function () {
  return {
    "name": "<workflow_name>",
    "workflow_file": "<postman_collection_file.json>",
    "action":"execute",
    "environment": {
      "values": [
        {
          "enabled": "true",
          "key": "iWorkflow1_Mgmt_IP",
          "value": "<x.x.x.x>",
          "type": "text"
        },
        {
          "enabled": "true",
          "key": "tenant_username",
          "value": "<username>",
          "type": "text"
        },
        {
          "enabled": "true",
          "key": "tenant_password",
          "value": "<password>",
          "type": "text"
        }
      ]
    }
  };
};

module.exports = festivus;
