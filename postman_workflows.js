//This iControlLX Extension will run pre-installed POSTMAN collections.
var logger = require('f5-logger').getInstance();
//var host = require('os').hostname();
var fs = require('fs');
var newman = require('newman');

// Constructor
function postman_workflows() {
}

// Declare worker path
postman_workflows.prototype.WORKER_URI_PATH = "shared/postman_workflows";

// Attribute declares worker is public and visible off box
postman_workflows.prototype.isPublic = true;

postman_workflows.prototype.onStart = function(success, error) {

  logger.info("postman_workflows onStart()...\tReading workflows...");

  //Read the installed workflows defined in workflows.json
  var data = fs.readFileSync('/usr/share/rest/node/src/workers/postman_workflows/workflows.json');
  data = JSON.parse(data);

//Print out the workflows to show it loaded fine
  for (var i in data.items) {
    logger.info('Workflow found: ' +data.items[i].name);
  }

//    logger.info('./workflows.json: ' +data);

  //workflows and there status
  this.state = data;
  success();
};

postman_workflows.prototype.onGet = function(restOperation) {
  logger.info("GET " +this.WORKER_URI_PATH);
  restOperation.setBody(this.state);
  this.completeRestOperation(restOperation);
};

postman_workflows.prototype.onPost = function(restOperation) {
  var newState = restOperation.getBody();

  logger.info('workflow_file: ' +newState.workflow_file);
  logger.info('action: ' +newState.action);

// Lets test environment variable here

  var env = {
    values: [
      {
        enabled: true,
        key: "iWorkflow1_Mgmt_IP",
        value: "192.168.202.162",
        type: "text"
      },
      {
        enabled: true,
        key: "tenant_username",
        value: "user1",
        type: "text"
      },
      {
        enabled: true,
        key: "tenant_password",
        value: "admin",
        type: "text"
      }
    ]
  };

  logger.info('env: ' +JSON.stringify(env));

// Is this new settings or is it from the iWorkflow subscription
  if (typeof newState.action !==  'undefined' && newState.action) {
    if (newState.action == 'execute') {
      newman.execute({
        collection: require('/usr/share/rest/node/src/workers/postman_workflows/workflows/' +newState.workflow_file),
        environment: env,
        outputFile: "/var/log/restnoded/outfile.json",
        reporters: 'cli',
        asLibrary: true,
        stopOnError: true
      }, function (err) {
        if (err) {
          logger.info('postman_workflows workflow error: ' +err);
          throw err;
          }
        logger.info('postman_workflows workflow executed');
      });

    }   //This message includes 'slack' settings
    this.state = newState;
  }
  restOperation.setBody(this.state);
  this.completeRestOperation(restOperation);
};

module.exports = postman_workflows;
