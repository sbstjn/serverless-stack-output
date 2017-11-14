# Serverless Stack Output Plugin

[![npm](https://img.shields.io/npm/v/serverless-stack-output.svg)](https://www.npmjs.com/package/serverless-stack-output)
[![license](https://img.shields.io/github/license/sbstjn/serverless-stack-output.svg)](https://github.com/sbstjn/serverless-stack-output/blob/master/LICENSE.md)
[![CircleCI](https://img.shields.io/circleci/project/github/sbstjn/serverless-stack-output.svg)](https://circleci.com/gh/sbstjn/serverless-stack-output)
[![Coveralls](https://img.shields.io/coveralls/sbstjn/serverless-stack-output.svg)](https://coveralls.io/github/sbstjn/serverless-stack-output)

A [serverless](https://serverless.com) plugin to store output from your AWS CloudFormation Stack in JSON/YAML/TOML files, or to pass the output to a JavaScript function for further processing.

## Usage

### Install

```bash
$ > yarn add serverless-stack-output
```

```bash
$ > npm install serverless-stack-output
```

### Configuration

```yaml
plugins:
  - serverless-stack-output

custom:
  output:
    handler: scripts/output.handler # Same syntax as you already know
    file: .build/stack.toml # toml, yaml, yml, and json format is available
```

### Handler

Based on the configuration above the plugin will search for a file `scripts/output.js` with the following content:

```js
function handler (data, serverless, options) {
  console.log('Received Stack Output', data)
}

module.exports = { handler }
```

### File Formats

Just name your file with a `.json`, `.toml`, `.yaml`, or `.yml` extension, and the plugin will take care of formatting your output. Please make sure the location where you want to save the file exists!

## License

Feel free to use the code, it's released using the [MIT license](LICENSE.md).

## Contribution

You are more than welcome to contribute to this project! 😘 🙆

To make sure you have a pleasant experience, please read the [code of conduct](CODE_OF_CONDUCT.md). It outlines core values and believes and will make working together a happier experience.

## Example

The plugins works fine with serverless functions, as well as when using custom CloudFormation resources. The following example configuration will deploy an AWS Lambda function, API Gateway, SQS Queue, IAM User with AccessKey and SecretKey, and a static value:

### Serverless.yml

```yaml
service: sls-stack-output-example

plugins:
  - serverless-stack-output

package:
  exclude:
    - node_modules/**

custom:
  output:
    handler: scripts/output.handler
    file: .build/stack.toml

provider:
  name: aws
  runtime: nodejs6.10

functions:
  example:
    handler: functions/example.handle
    events:
      - http:
          path: example
          method: get
          cors: true

resources:
  Resources:
    ExampleQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: example-queue
    ExampleUser:
      Type: "AWS::IAM::User"
      Properties:
        UserName: example-user
        Policies:
          - PolicyName: ExampleUserSQSPolicy
            PolicyDocument:
              Version: '2012-10-17'
              Statement:
                - Effect: "Allow"
                  Action:
                    - sqs:SendMessage
                  Resource:
                    - {"Fn::Join": [":", ["arn:aws:sqs:*", {"Ref": "AWS::AccountId"}, "example-queue"]]}
    ExampleUserKey:
      Type: AWS::IAM::AccessKey
      Properties:
        UserName:
          Ref: ExampleUser
  Outputs:
    ExampleUserKey:
      Value:
        Ref: ExampleUserKey
    ExampleUserSecret:
      Value: {"Fn::GetAtt": ["ExampleUserKey", "SecretAccessKey"]}
    ExampleStaticValue:
      Value: example-static-value
```

### Stack Output

#### TOML

```toml
ExampleUserSecret = "YourUserSecretKey"
ExampleUserKey = "YourUserAccessKey"
ExampleLambdaFunctionQualifiedArn = "arn:aws:lambda:us-east-1:AccountID:function:sls-stack-output-example-dev-example:9"
ExampleStaticValue = "example-static-value"
ServiceEndpoint = "https://APIGatewayID.execute-api.us-east-1.amazonaws.com/dev"
ServerlessDeploymentBucketName = "sls-stack-output-example-serverlessdeploymentbuck-BucketID"
```

#### YAML

```yaml
ExampleUserSecret: YourUserSecretKey
ExampleUserKey: YourUserAccessKey
ExampleLambdaFunctionQualifiedArn: 'arn:aws:lambda:us-east-1:AccountID:function:sls-stack-output-example-dev-example:9'
ExampleStaticValue: example-static-value
ServiceEndpoint: 'https://APIGatewayID.execute-api.us-east-1.amazonaws.com/dev'
ServerlessDeploymentBucketName: sls-stack-output-example-serverlessdeploymentbuck-BucketID
```

#### JSON

```json
{
  "ExampleUserSecret": "YourUserSecretKey",
  "ExampleUserKey": "YourUserAccessKey",
  "ExampleLambdaFunctionQualifiedArn": "arn:aws:lambda:us-east-1:AccountID:function:sls-stack-output-example-dev-example:9",
  "ExampleStaticValue": "example-static-value",
  "ServiceEndpoint": "https://APIGatewayID.execute-api.us-east-1.amazonaws.com/dev",
  "ServerlessDeploymentBucketName": "sls-stack-output-example-serverlessdeploymentbuck-BucketID"
}
```