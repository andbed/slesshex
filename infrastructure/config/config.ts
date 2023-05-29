import {Environment} from "aws-cdk-lib";

export enum DeploymentName {
    personal = 'personal',
    dev = 'dev',
    test = 'test',
    prod = 'prod',
}

const devAwsEnv = {account: '515467239880', region: 'eu-central-1'};
const testAwsEnv = {account: '515467239880', region: 'us-west-2'};
const prodAwsEnv = {account: '515467239880', region: 'us-east-2'};

export abstract class Config {
    abstract awsEnv: Environment;
    abstract deploymentName: DeploymentName;
    shouldKeepStatefulResources = false;

    deploymentPrefix = () => `slesshex-${this.deploymentName}`;
}

export class PersonalConfig extends Config {
    awsEnv = devAwsEnv;
    deploymentName = DeploymentName.personal;
    deploymentPrefix = () => `slesshex-${process.env.USER ?? 'unknown-user'}`;
}

export class DevConfig extends Config {
    awsEnv = devAwsEnv;
    deploymentName = DeploymentName.dev;
}

export class TestConfig extends Config {
    awsEnv = testAwsEnv;
    deploymentName: DeploymentName = DeploymentName.test;
}

export class ProdConfig extends Config {
    awsEnv = prodAwsEnv;
    deploymentName: DeploymentName = DeploymentName.prod;
    shouldKeepStatefulResources = true;
}

