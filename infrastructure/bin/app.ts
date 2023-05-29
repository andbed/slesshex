#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SlessHexStack } from '../lib/sless-hex-stack';
import {DevConfig, PersonalConfig, ProdConfig, TestConfig} from "../config/config";

const app = new cdk.App();

new SlessHexStack(app, new PersonalConfig());
new SlessHexStack(app, new DevConfig());
new SlessHexStack(app, new TestConfig());
new SlessHexStack(app, new ProdConfig());
