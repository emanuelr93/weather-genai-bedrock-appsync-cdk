#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkAppsyncGenAIWeatherDemoStack } from "../lib/cdk-appsync-genai-weather-demo-stack";

const env  = { region: 'eu-south-1' };
const app = new cdk.App();
new CdkAppsyncGenAIWeatherDemoStack(app, 'CdkAppsyncGenAIWeatherDemoStack', { env } );