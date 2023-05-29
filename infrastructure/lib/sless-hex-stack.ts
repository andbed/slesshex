import * as cdk from 'aws-cdk-lib';
import {
    aws_dynamodb as dynamodb,
    aws_lambda as lambda,
    aws_lambda_event_sources as lambda_event_sources,
} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigatewayv2_integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import {Config} from "../config/config";

export class SlessHexStack extends cdk.Stack {
    constructor(scope: Construct, config: Config) {

        super(scope, `${config.deploymentPrefix()}`, {
            env: config.awsEnv,
            description: 'CDK version of serverless-hexagonal by PZ'
        });

        const eventsTable = new dynamodb.Table(this, 'events', {
            partitionKey: {name: 'PK', type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: getRemovalPolicy(config.shouldKeepStatefulResources),
            stream: dynamodb.StreamViewType.NEW_IMAGE,
        })

        const processItemLambda = new lambda.Function(this, 'processItem', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('../src'),
            handler: 'processItem/function.handler',
            description: 'Triggered by DynamoDB Streams. Does some work on newly created Item',
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            environment: {
                message: 'Hello World!',
            },
        });
        eventsTable.grantReadData(processItemLambda)
        processItemLambda.addEventSource(new lambda_event_sources.DynamoEventSource(eventsTable, {
            startingPosition: lambda.StartingPosition.LATEST,
            retryAttempts: 1,
            batchSize: 1,
        }));

        const createItemLambda = new lambda.Function(this, 'createItem', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('../src'),
            handler: 'createItem/function.handler',
            description: 'Create Item in repository',
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            environment: {
                tableName: eventsTable.tableName,
                region: config.awsEnv.region!,
            }
        });
        eventsTable.grantReadWriteData(createItemLambda)
        const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi');
        httpApi.addRoutes({
            path: '/item',
            methods: [apigatewayv2.HttpMethod.POST],
            integration: new apigatewayv2_integrations.HttpLambdaIntegration('ApiIntegration', createItemLambda),
        });

        new cdk.CfnOutput(this, 'url', {value: httpApi.url || ""});
        new cdk.CfnOutput(this, 'tableName', {value: eventsTable.tableName});

    }
}

export function getRemovalPolicy(shouldKeep: boolean) {
    return shouldKeep ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
}
