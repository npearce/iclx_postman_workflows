//This iControlLX Extension will run pre-installed POSTMAN collections.
var logger = require('f5-logger').getInstance();
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
  logger.info('environment: ' +JSON.stringify(newState.environment,' ', '\t'));

// Is this new settings or is it from the iWorkflow subscription
  if (typeof newState.action !==  'undefined' && newState.action) {
    if (newState.action == 'execute') {
      newman.run({
        collection: require('/usr/share/rest/node/src/workers/postman_workflows/workflows/' +newState.workflow_file),
        environment: newState.environment,
//        outputFile: "/var/log/newman_outfile.json", <- does not work via iControlLX
        reporters: 'cli',
        insecure: true
      })
      .on('start', function(err, start_summary) {
        if (err) {
          logger.info('postman_workflows on start error: ' +err);
          restOperation.setBody(err);
          postman_workflows.prototype.completeRestOperation(restOperation);
        }
        else {
          logger.info('newman.run.on.start - summary: ' +JSON.stringify(start_summary, ' ', '\t'));
          restOperation.setBody(start_summary);
          postman_workflows.prototype.completeRestOperation(restOperation);
        }
      })
      .on('done', function (err, done_summary) {
        if (err) {
          logger.info('postman_workflows on done error: ' +err);
//          restOperation.setBody(err);
//          postman_workflows.prototype.completeRestOperation(restOperation);
        }
        else {
//          logger.info('newman.run.on.done - summary: ' +JSON.stringify(done_summary, ' ', '\t'));
          logger.info('newman.run.on.done');
//          restOperation.setBody(done_summary);
//          postman_workflows.prototype.completeRestOperation(restOperation);
        }
      });

    }
  }
};

module.exports = postman_workflows;
