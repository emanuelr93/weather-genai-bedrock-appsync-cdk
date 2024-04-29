// @ts-ignore

import * as cdk from 'aws-cdk-lib';
import {
  AppsyncFunction,
  AuthorizationType,
  Code,
  Definition, FieldLogLevel,
  FunctionRuntime,
  GraphqlApi,
  HttpDataSource,
  Resolver
} from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import path = require('path');
import {PolicyStatement} from "aws-cdk-lib/aws-iam";

export class CdkAppsyncGenAIWeatherDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'WeatherApi', {
      name: 'weather-api',
      definition: Definition.fromFile(path.join(__dirname, '../graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
      },
      logConfig: {fieldLogLevel: FieldLogLevel.ALL},
      xrayEnabled: true,
    });

    const bedrockDataSource = api.addHttpDataSource(
        'bedrockDS',
        'https://bedrock-runtime.us-east-1.amazonaws.com',
        {
          authorizationConfig: {
            signingRegion: 'us-east-1',
            signingServiceName: 'bedrock',
          },
        }
    );

    bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
        new PolicyStatement({
          resources: [
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
          ],
          actions: ['bedrock:InvokeModel'],
        })
    );

    const getGenAI = new AppsyncFunction(this, 'GetGenAI', {
      name: 'getGenAi',
      api,
      dataSource: bedrockDataSource,
      code: Code.fromAsset(path.join(__dirname, '../resolvers/getGenAI.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    const weatherDataSource = new HttpDataSource(this, "WeatherHTTPDS", {
      api: api,
      name: "OpenWeatherApiDataSource",
      endpoint: "https://api.open-meteo.com/",
    });

    const getWeather = new AppsyncFunction(this, 'GetWeather', {
      name: 'getWeather',
      api,
      dataSource: weatherDataSource,
      code: Code.fromAsset(path.join(__dirname, '../resolvers/getWeather.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new Resolver(this, 'PipelineResolverGetWeather', {
      api,
      typeName: 'Query',
      fieldName: 'getWeather',
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(path.join(__dirname, '../resolvers/pipeline.js')),
      pipelineConfig: [getWeather, getGenAI],
    });
  }
}