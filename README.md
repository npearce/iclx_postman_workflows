# ilxe_postman_workflows

## About
This is an example iControlLX worker that enables the execution of POSTMAN collections via the iWorkflow iControl REST API.

iControlLX (iControl Language eXtension) extensions support bespoke functionality and workflows within the iControl REST API.

### To view the available workflows:
```GET /mgmt/shared/festivus```

Response should look like the following (NOTE: with example input requirements):

```
{
  "items": [
    {
    "name": "ilxe_postman_workflows-list_services",
    "workflow_file": "ilxe_postman_workflows-list_services.postman_collection.json",
    "inputs": {
      "iWorkflow1_Mgmt_IP":"x.x.x.x",
      "tenant_username":"<username>",
      "tenant_password":"<password>"
      }
    },
    {
    "name": "other_workflow",
    "workflow_file": "ilxe_postman_workflows-list_services.postman_collection.json",
    "inputs": {
      "iWorkflow1_Mgmt_IP":"x.x.x.x",
      "tenant_username":"<username>",
      "tenant_password":"<password>"
      }
    }
  ]
}
```


### To execute a POSTMAN workflow

```
POST /mgmt/shared/festivus

{
  "name": "ilxe_postman_workflows-list_services",
  "workflow_file": "ilxe_postman_workflows-list_services.postman_collection.json",
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
}
```
